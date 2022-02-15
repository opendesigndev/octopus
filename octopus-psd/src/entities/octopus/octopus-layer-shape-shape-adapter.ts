import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { Octopus } from '../../typings/octopus'
import { OctopusLayerShapePath } from './octopus-layer-shape-path'
import { OctopusEffectFill } from './octopus-effect-fill'
import { OctopusEffectStroke } from './octopus-effect-stroke'

type OctopusLayerShapeShapeAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export class OctopusLayerShapeShapeAdapter extends OctopusLayerCommon {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusLayerShapeShapeAdapterOptions) {
    super(options)
  }

  get sourceLayer(): SourceLayerShape {
    return this._sourceLayer
  }

  get layerTranslation(): [number, number] {
    const { left, top } = this._sourceLayer.pathBounds
    return [left, top]
  }

  private get _path(): Octopus['PathLike'] {
    return new OctopusLayerShapePath({ parent: this }).convert()
  }

  private get _fills(): Octopus['Fill'][] {
    const fill = new OctopusEffectFill({ parent: this, fill: this.sourceLayer.fill }).convert()
    return fill ? [fill] : []
  }

  private get _strokes(): Octopus['VectorStroke'][] {
    const stroke = new OctopusEffectStroke({ parent: this }).convert()
    return [stroke]
  }

  private get _shapes(): Octopus['Shape'][] {
    const fillShape: Octopus['Shape'] = {
      fillRule: 'EVEN_ODD',
      path: this._path,
      fills: this._fills,
      // strokes: this._strokes, // TODO
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
