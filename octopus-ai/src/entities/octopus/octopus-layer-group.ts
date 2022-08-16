import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { createOctopusLayer } from '../../factories/create-octopus-layer'
import { initChildLayers } from '../../utils/layer'
import { OctopusLayerCommon } from './octopus-layer-common'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { SourceLayerGroup } from '../source/source-layer-group'
import type { SourceLayerXObjectForm } from '../source/source-layer-x-object-form'
import type { LayerSpecifics } from './octopus-layer-common'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerGroup | SourceLayerXObjectForm
}

export class OctopusLayerGroup extends OctopusLayerCommon {
  private _layers: OctopusLayer[]
  protected _sourceLayer: SourceLayerGroup | SourceLayerXObjectForm

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _initLayers(): OctopusLayer[] {
    return initChildLayers({
      parent: this,
      layers: this._sourceLayer.children,
      builder: createOctopusLayer,
    }) as OctopusLayer[]
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

    if (!common || !specific) return null

    return {
      ...common,
      ...specific,
    }
  }
}
