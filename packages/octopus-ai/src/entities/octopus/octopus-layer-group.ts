import { getConverted } from '@opendesign/octopus-common/dist/utils/common.js'

import { OctopusLayerCommon } from './octopus-layer-common.js'
import { initOctopusLayerChildren } from '../../utils/layer.js'

import type { LayerSpecifics } from './octopus-layer-common.js'
import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service/index.js'
import type { Octopus } from '../../typings/octopus/index.js'
import type { OctopusLayerParent } from '../../typings/octopus-entities.js'
import type { SourceLayerGroup } from '../source/source-layer-group.js'
import type { SourceLayerXObjectForm } from '../source/source-layer-x-object-form.js'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerGroup extends OctopusLayerCommon {
  private _layers: OctopusLayer[]
  declare _sourceLayer: SourceLayerGroup | SourceLayerXObjectForm

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _initLayers(): OctopusLayer[] {
    return initOctopusLayerChildren({
      parent: this,
      layers: this._sourceLayer.children,
    })
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['GroupLayer']> | null {
    const layers = getConverted(this._layers)

    return {
      type: 'GROUP',
      layers,
    }
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertCommon()
    const specific = this._convertTypeSpecific()

    if (!specific || specific.layers.length === 0) {
      return null
    }

    return {
      ...common,
      ...specific,
    }
  }
}
