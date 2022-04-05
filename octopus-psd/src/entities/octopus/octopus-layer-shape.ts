import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import { OctopusLayerBase, OctopusLayerParent } from './octopus-layer-base'
import type { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import type { OctopusLayerShapeAdjustmentAdapter } from './octopus-layer-shape-adjustment-adapter'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
  adapter: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter | OctopusLayerShapeAdjustmentAdapter
}

export class OctopusLayerShape extends OctopusLayerBase {
  private _adapter: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter | OctopusLayerShapeAdjustmentAdapter

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._adapter = options.adapter
  }

  convert(): Octopus['ShapeLayer'] | null {
    return this._adapter.convert()
  }
}
