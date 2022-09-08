import { BLEND_MODES } from '../../utils/blend-modes'
import { OctopusArtboard } from './octopus-artboard'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { SourceResources } from '../source/source-resources'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

/** @TODO fix exclusion of `type` from return type after schema update */
export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>

type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export abstract class OctopusLayerCommon {
  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer

  static DEFAULT_OPACITY = 1

  constructor(options: OctopusLayerCommonOptions) {
    const [sourceLayer] = options.layerSequence.sourceLayers
    this._parent = options.parent
    this._sourceLayer = sourceLayer
    this._id = sourceLayer.id
  }

  get parent(): OctopusLayerParent {
    return this._parent
  }

  get id(): string {
    return this._id
  }

  get resources(): Nullish<SourceResources> {
    return this._sourceLayer.resources
  }

  get parentArtboard(): OctopusArtboard {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  get blendMode(): Octopus['LayerBase']['blendMode'] {
    const blendModeKey = this._sourceLayer.blendMode
    if (!blendModeKey) {
      return BLEND_MODES.Normal
    }

    const blendMode = BLEND_MODES[blendModeKey]

    if (blendMode) {
      return blendMode
    }

    return blendModeKey
      .replace(/\.?([A-Z][a-z]+)/g, (x, y) => `_${y.toUpperCase()}`)
      .replace(/^_/, '') as Octopus['LayerBase']['blendMode']
  }

  get opacity(): number {
    return this._sourceLayer.opacity ?? OctopusLayerCommon.DEFAULT_OPACITY
  }

  convertCommon(): Omit<Octopus['LayerBase'], 'type'> {
    return {
      blendMode: this.blendMode,
      opacity: this.opacity,
      id: this.id,
      ...(this._sourceLayer.name ? { name: this._sourceLayer.name } : null),
    }
  }
}
