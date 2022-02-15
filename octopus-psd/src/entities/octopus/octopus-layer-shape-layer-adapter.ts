import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { Octopus } from '../../typings/octopus'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'
import { createDefaultTranslationMatrix } from '../../utils/path'

type OctopusLayerShapeLayerAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerLayer
}

export class OctopusLayerShapeLayerAdapter extends OctopusLayerCommon {
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
    const sourceLayer = this.sourceLayer as SourceLayerLayer
    const { width, height } = sourceLayer.bounds
    const rectangle = { x0: 0, y0: 0, x1: width, y1: height }
    const transform = createDefaultTranslationMatrix()
    return { type: 'RECTANGLE', rectangle, transform }
  }

  private get _fills(): Octopus['Fill'][] {
    const fill = new OctopusEffectFillImage({ parent: this }).convert()
    return [fill]
  }

  private get _shapes(): Octopus['Shape'][] {
    const fillShape: Octopus['Shape'] = {
      fillRule: 'EVEN_ODD',
      path: this._path,
      fills: this._fills,
    }
    return [fillShape]
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    return {
      type: 'SHAPE',
      shapes: this._shapes,
    } as const
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
