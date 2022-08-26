import type { Octopus, OctopusLayerShapeAdapter } from '../../typings/octopus'

type OctopusLayerShapeOptions = {
  adapter: OctopusLayerShapeAdapter
}

export class OctopusLayerShape {
  private _adapter: OctopusLayerShapeAdapter

  constructor(options: OctopusLayerShapeOptions) {
    this._adapter = options.adapter
  }

  convert(): Octopus['ShapeLayer'] | null {
    return this._adapter.convert()
  }
}
