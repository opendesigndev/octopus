import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { createOctopusLayer } from '../../factories/create-octopus-layer.js'
import OctopusLayerCommon from './octopus-layer-common.js'

import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { Octopus } from '../../typings/octopus/index.js'
import type { OctopusLayerParent } from '../../typings/octopus-entities.js'
import type SourceLayerGroup from '../source/source-layer-group.js'
import type { LayerSpecifics } from './octopus-layer-common.js'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerGroup
}

export default class OctopusLayerGroup extends OctopusLayerCommon {
  private _layers: OctopusLayer[]
  protected _sourceLayer: SourceLayerGroup

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = this._initLayers()
  }

  private _initLayers(): OctopusLayer[] {
    return this._sourceLayer.children.reduce((layers, sourceLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: sourceLayer,
      })
      return octopusLayer ? [...layers, octopusLayer] : layers
    }, [])
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
