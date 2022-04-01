import { createOctopusLayer } from '../../factories/create-octopus-layer'
import OctopusLayerCommon from './octopus-layer-common'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type SourceLayerGroup from '../source/source-layer-group'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { LayerSpecifics } from './octopus-layer-common'
import { getConverted, push } from '@avocode/octopus-common/dist/utils/common'

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
      return octopusLayer ? push(layers, octopusLayer) : layers
    }, [])
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['GroupLayer']> {
    return {
      type: 'GROUP',
      layers: getConverted(this._layers),
    } as const
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
