import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import { OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'
import type { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
  adapter: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter
}

export class OctopusLayerShape extends OctopusLayerBase {
  private _adapter: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._adapter = options.adapter
  }

  convert(): Octopus['ShapeLayer'] | null {
    return this._adapter.convert()
  }
}
