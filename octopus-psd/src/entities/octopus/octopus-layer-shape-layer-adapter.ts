import { LayerSpecifics, OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { Octopus } from '../../typings/octopus'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import { createDefaultTranslationMatrix } from '../../utils/path'
import path from 'path'
import { FOLDER_IMAGES } from '../../utils/const'

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

  private get _fills(): Octopus['Fill'][] {
    const imagePath = path.join(FOLDER_IMAGES, this.sourceLayer.imageName ?? '')
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

  private get _shape(): Octopus['Shape'] {
    const fillShape: Octopus['Shape'] = {
      fillRule: 'EVEN_ODD',
      path: this._path,
      fills: this._fills,
    }
    return fillShape
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    return {
      type: 'SHAPE',
      shape: this._shape,
      shapes: [this._shape], // TODO remove when fixed in Octopus specification
    } as const
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
