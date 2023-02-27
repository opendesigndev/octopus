import { OctopusLayerBase } from './octopus-layer-base.js'

import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { Octopus } from '../../typings/octopus.js'
import type { OctopusLayerParent } from './octopus-layer-base.js'
import type { OctopusLayerShapeAdjustmentAdapter } from './octopus-layer-shape-adjustment-adapter.js'
import type { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter.js'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter.js'

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
