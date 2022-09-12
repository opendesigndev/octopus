import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { initOctopusLayerChildren } from '../../utils/layer'
import { OctopusLayerCommon } from './octopus-layer-common'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { SourceLayerGroup } from '../source/source-layer-group'
import type { SourceLayerXObjectForm } from '../source/source-layer-x-object-form'
import type { LayerSpecifics } from './octopus-layer-common'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerGroup extends OctopusLayerCommon {
  private _layers: OctopusLayer[]
  protected _sourceLayer: SourceLayerGroup | SourceLayerXObjectForm

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
