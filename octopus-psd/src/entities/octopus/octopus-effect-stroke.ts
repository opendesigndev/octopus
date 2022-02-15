import type { Octopus } from '../../typings/octopus'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'

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
    const thickness = 10 // TODO
    const position = 'CENTER' // TODO
    const fill = new OctopusEffectFillColor({ fill: this.sourceLayer.stroke.fill }).convert() // TODO
    const style = 'SOLID' // TODO
    const lineJoin = 'BEVEL' // TODO BEVEL ROUND MITER
    const lineCap = 'ROUND' // TODO ROUND BUTT SQUARE

    return { thickness, position, fill, style, lineJoin, lineCap }
  }
}
