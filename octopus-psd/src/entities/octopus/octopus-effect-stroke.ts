import type { Octopus } from '../../typings/octopus'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'

type OctopusStrokeOptions = {
  parent: OctopusLayerShapeShapeAdapter
}

export class OctopusEffectStroke {
  protected _parent: OctopusLayerShapeShapeAdapter

  constructor(options: OctopusStrokeOptions) {
    this._parent = options.parent
  }

  get sourceLayer(): SourceLayerShape {
    return this._parent.sourceLayer
  }

  convert(): Octopus['VectorStroke'] {
    const sourceLayer = this.sourceLayer
    const stroke = sourceLayer.strokeStyle

    const thickness = 10 // TODO
    const position = 'CENTER' // TODO
    const fill = new OctopusEffectFillColor({ fill: stroke.fill }).convert() // TODO
    const style = 'SOLID' // TODO
    const lineJoin = 'BEVEL' // TODO BEVEL ROUND MITER
    const lineCap = 'ROUND' // TODO ROUND BUTT SQUARE

    return { thickness, position, fill, style, lineJoin, lineCap }
  }
}
