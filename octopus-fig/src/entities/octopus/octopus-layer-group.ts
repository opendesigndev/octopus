import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import { createOctopusLayers } from '../../factories/create-octopus-layer.js'
import { OctopusLayerBase } from './octopus-layer-base.js'

import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceLayerFrame } from '../source/source-layer-frame.js'
import type { LayerSpecifics, OctopusLayerParent } from './octopus-layer-base.js'

type OctopusLayerGroupOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerFrame
}

export class OctopusLayerGroup extends OctopusLayerBase {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerFrame
  private _layers: OctopusLayer[]

  constructor(options: OctopusLayerGroupOptions) {
    super(options)
    this._layers = createOctopusLayers(this._sourceLayer.layers, this)
  }

  get layers(): OctopusLayer[] {
    return this._layers
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['GroupLayer']> {
    return {
      type: 'GROUP',
      layers: getConverted(this._layers),
    } as const
  }

  convert(): Octopus['GroupLayer'] | null {
    const common = this.convertBase()
    if (!common) return null

    const specific = this._convertTypeSpecific()
    if (!specific) return null

    return { ...common, ...specific }
  }
}
