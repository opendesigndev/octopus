import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { logger } from '../../services/instances/logger'
import { createDefaultTranslationMatrix } from '../../utils/path'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import { OctopusLayerBase } from './octopus-layer-base'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base'

type OctopusLayerShapeLayerAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerLayer
}

export class OctopusLayerShapeLayerAdapter extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerLayer

  constructor(options: OctopusLayerShapeLayerAdapterOptions) {
    super(options)
  }

  get sourceLayer(): SourceLayerLayer {
    return this._sourceLayer
  }

  get layerTranslation(): [number, number] {
    const { left, top } = this._sourceLayer.bounds
    return [left, top]
  }

  private get _path(): Octopus['PathLike'] {
    const { width, height } = this.sourceLayer.bounds
    const rectangle = { x0: 0, y0: 0, x1: width, y1: height }
    const transform = createDefaultTranslationMatrix()
    return { type: 'RECTANGLE', rectangle, transform }
  }

  get opacity(): number {
    return this._sourceLayer.opacity * this._sourceLayer.fillOpacity
  }

  @firstCallMemo()
  private get _fills(): Octopus['Fill'][] | null {
    const imageName = this.sourceLayer.imageName
    if (imageName === undefined) return null
    const imagePath = this._designConverter.octopusManifest.getExportedRelativeImageByName(imageName)
    if (imagePath === undefined) {
      logger.warn('Unknown image', { imagePath, imageName })
      return null
    }
    const { width, height } = this.sourceLayer.bounds
    const transform: Octopus['Transform'] = [width, 0, 0, height, 0, 0]
    const fill = new OctopusEffectFillImage({
      imagePath,
      transform,
      layout: 'STRETCH',
      origin: 'LAYER',
    }).convert()
    return [fill]
  }

  private get _shape(): Octopus['Shape'] | null {
    const fills = this._fills
    if (fills === null) return null
    const fillShape: Octopus['Shape'] = {
      fillRule: 'EVEN_ODD',
      path: this._path,
      fills,
    }
    return fillShape
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> | null {
    const shape = this._shape
    if (shape === null) return null
    const meta = this._meta
    return { type: 'SHAPE', shape, meta } as const
  }

  private get _meta(): Octopus['LayerMeta'] | undefined {
    return this.sourceLayer.smartObject ? { origin: { type: 'PHOTOSHOP_SMART_OBJECT' } } : undefined
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
