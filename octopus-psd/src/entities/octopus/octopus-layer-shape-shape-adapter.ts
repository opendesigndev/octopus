import { LayerSpecifics, OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { Octopus } from '../../typings/octopus'
import { OctopusLayerShapeShapePath } from './octopus-layer-shape-shape-path'
import { OctopusEffectFill } from './octopus-effect-fill'
import { OctopusEffectStroke } from './octopus-effect-stroke'

type OctopusLayerShapeShapeAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export class OctopusLayerShapeShapeAdapter extends OctopusLayerBase {
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
    return new OctopusLayerShapeShapePath({ parent: this }).convert()
  }

  private get _fills(): Octopus['Fill'][] {
    const fill = new OctopusEffectFill({ parent: this, fill: this.sourceLayer.fill }).convert()
    return fill ? [fill] : []
  }

  private get _strokes(): Octopus['VectorStroke'][] {
    const stroke = new OctopusEffectStroke({ parent: this }).convert()
    return stroke ? [stroke] : []
  }

  private get _shape(): Octopus['Shape'] {
    return {
      fillRule: 'EVEN_ODD',
      path: this._path,
      fills: this._fills,
      strokes: this._strokes,
    }
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    return {
      type: 'SHAPE',
      shape: this._shape,
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
