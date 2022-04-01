import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus, OctopusLayerShapeAdapter } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayers: SourceLayer[]
  adapter: OctopusLayerShapeAdapter
}

export default class OctopusLayerShape {
  private _adapter: OctopusLayerShapeAdapter

  constructor(options: OctopusLayerShapeOptions) {
    this._adapter = options.adapter
  }

  convert(): Octopus['ShapeLayer'] | null {
    return this._adapter.convert()
  }
}
