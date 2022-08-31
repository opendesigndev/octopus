import { getConverted } from '@avocode/octopus-common/dist/utils/common'
import uniqueId from 'lodash/uniqueId'

import { buildOctopusLayer, createOctopusLayerShapeFromShapeAdapter } from '../../factories/create-octopus-layer'
import { createOctopusLayersFromSequences } from '../../utils/layer'
import { OctopusLayerCommon } from './octopus-layer-common'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

type OctopusLayerMaskOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerMaskGroup extends OctopusLayerCommon {
  private _layers: OctopusLayer[] = []
  private _layerSequences: LayerSequence[] = []
  protected _id: string

  private static _maskGroupOrder = 0
  private static _isNextChildLayerMaskedByNewMask = false

  private static _registry: { [keyCheck: string]: OctopusLayerMaskGroup } = {}

  private static _getMaskGroupHashKeyWithOrder(hashKey: string): string {
    return `${hashKey}-${this._maskGroupOrder}`
  }

  static registerMaskGroup(hashKey: string, maskGroup: OctopusLayerMaskGroup): void {
    this._maskGroupOrder = this._maskGroupOrder + 1
    this._registry[this._getMaskGroupHashKeyWithOrder(hashKey)] = maskGroup
  }

  static getRegisteredMaskGroup(hashkKey: string): OctopusLayerMaskGroup {
    const maskGroupHashKey = this._getMaskGroupHashKeyWithOrder(hashkKey)

    return this._registry[maskGroupHashKey]
  }

  static isMaskGroupRegistered(hashKey: string | null) {
    if (!hashKey || this._isNextChildLayerMaskedByNewMask) {
      return false
    }

    const maskGroupHashKey = this._getMaskGroupHashKeyWithOrder(hashKey)

    return Boolean(OctopusLayerMaskGroup._registry[maskGroupHashKey])
  }

  static setIsNextChildLayerMaskedByNewMask(isNextChildLayerMaskedByNewMask: boolean): void {
    this._isNextChildLayerMaskedByNewMask = isNextChildLayerMaskedByNewMask
  }

  constructor(options: OctopusLayerMaskOptions) {
    super(options)

    this._id = uniqueId()
  }

  addLayerSequence(layerSequence: LayerSequence): void {
    this._layerSequences.push(layerSequence)
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
    this._layers = createOctopusLayersFromSequences({
      layerSequences: this._layerSequences,
      parent: this,
      builder: buildOctopusLayer,
    })

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
