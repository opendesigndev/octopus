import { buildOctopusLayer, createOctopusLayerShapeFromShapeAdapter } from '../../factories/create-octopus-layer'
import { OctopusLayerCommon } from './octopus-layer-common'

import type { OctopusLayer } from '../../factories/create-octopus-layer'
import type { ClippedSourceLayer } from '../../factories/create-source-layer'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type OctopusLayerMaskOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerMaskGroup extends OctopusLayerCommon {
  static registerMaskGroup(key: string, maskGroup: OctopusLayerMaskGroup): void {
    this.registry[key] = maskGroup
  }

  public _sourceLayer: SourceLayerShape
  static registry: { [keyCheck: string]: OctopusLayerMaskGroup } = {}
  private _layers: OctopusLayer[] = []

  constructor(options: OctopusLayerMaskOptions) {
    super(options)
  }

  addChildLayerToMaskGroup(layer: ClippedSourceLayer): void {
    const octopusLayer = buildOctopusLayer({ layerSequence: { sourceLayers: [layer] }, parent: this })

    if (!octopusLayer) {
      return
    }

    this._layers.push(octopusLayer)
  }

  private _createMask(): Nullable<Octopus['ShapeLayer']> {
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
      layers: this._layers.map((layer) => layer.convert()).filter((converted) => converted) as Octopus['Layer'][],
      mask,
    } as const
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const common = this.convertCommon()
    const specific = this._convertTypeSpecific()

    if (!specific) {
      return null
    }

    return {
      ...common,
      ...specific,
    }
  }
}
