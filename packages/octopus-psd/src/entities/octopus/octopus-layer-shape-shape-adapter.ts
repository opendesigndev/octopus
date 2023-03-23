import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { OctopusEffectFill } from './octopus-effect-fill.js'
import { OctopusLayerBase } from './octopus-layer-base.js'
import { OctopusLayerShapeShapePath } from './octopus-layer-shape-shape-path.js'
import { OctopusStroke } from './octopus-stroke.js'

import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceLayerShape } from '../source/source-layer-shape.js'

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

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
