import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import uniqueId from 'lodash/uniqueId'

import { createOctopusLayerShapeFromShapeAdapter } from '../../factories/create-octopus-layer'
import { createOctopusLayersFromLayerSequences } from '../../utils/layer'
import { OctopusLayerCommon } from './octopus-layer-common'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { SourceLayerWithMask } from './octopus-layer-soft-mask-group'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

export type OctopusLayerMaskOptions = {
  parent: OctopusLayerParent
  layerSequences: LayerSequence[]
}

export class OctopusLayerMaskGroup extends OctopusLayerCommon {
  private _layers: OctopusLayer[] = []
  protected _id: string

  constructor({ parent, layerSequences }: OctopusLayerMaskOptions) {
    super({
      parent,
      layerSequence: { sourceLayers: [(layerSequences[0].sourceLayers[0] as SourceLayerWithMask).mask] },
    })

    this._id = uniqueId()

    this._layers = createOctopusLayersFromLayerSequences({
      layerSequences: layerSequences,
      parent: this,
    })
  }

  private _createMask(): Nullish<Octopus['ShapeLayer']> {
    const sourceMask = this._sourceLayer

    if (!sourceMask) {
      return null
    }

    const mask = createOctopusLayerShapeFromShapeAdapter({
      layerSequence: { sourceLayers: [sourceMask] },
      parent: this,
    }).convert()

    return mask
  }

  private _convertTypeSpecific() {
    const mask = this._createMask()

    if (!mask) {
      return null
    }

    return {
      type: 'MASK_GROUP' as const,
      maskBasis: 'BODY',
      layers: getConverted(this._layers),
      mask,
    } as const
  }

  convert(): Octopus['MaskGroupLayer'] | null {
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
