import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerShape } from '../source/source-layer-shape'
import { OctopusEffectFill } from './octopus-effect-fill'
import { LayerSpecifics, OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'
import { OctopusLayerShapeShapePath } from './octopus-layer-shape-shape-path'
import { OctopusStroke } from './octopus-stroke'

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

  @firstCallMemo()
  private get _path(): Octopus['PathLike'] {
    return new OctopusLayerShapeShapePath({ parentLayer: this }).convert()
  }

  @firstCallMemo()
  private get _fills(): Octopus['Fill'][] {
    const fill = new OctopusEffectFill({ parentLayer: this, fill: this.sourceLayer.fill }).convert()
    return fill ? [fill] : []
  }

  @firstCallMemo()
  private get _strokes(): Octopus['VectorStroke'][] {
    const stroke = new OctopusStroke({ parentLayer: this, stroke: this.sourceLayer.stroke }).convert()
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
