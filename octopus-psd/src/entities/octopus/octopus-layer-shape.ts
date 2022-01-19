import { OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import type { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'
import type { SourceLayer } from '../../factories/create-source-layer'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
  adapter: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter
}

export class OctopusLayerShape extends OctopusLayerCommon {
  private _adapter: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._adapter = options.adapter
  }

  convert(): Octopus['ShapeLayer'] | null {
    return this._adapter.convert()
  }
}
