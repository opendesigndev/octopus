import { BLEND_MODES } from '../../utils/blend-modes.js'

import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { Octopus } from '../../typings/octopus/index.js'
import type { OctopusLayerParent } from '../../typings/octopus-entities.js'
import type SourceResources from '../source/source-resources.js'

/** @TODO fix exclusion of `type` from return type after schema update */
export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>

type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
}

export default abstract class OctopusLayerCommon {
  static DEFAULT_OPACITY = 1

  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer

  constructor(options: OctopusLayerCommonOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer

    this._id = options.sourceLayer.path.join(':')
  }

  get parent(): OctopusLayerParent {
    return this._parent
  }

  get id(): string {
    return this._id
  }

  // get hiddenContentIds(): number[] {
  //   const hiddenContentIds: number[] = this._parent.hiddenContentIds || []
  //   return hiddenContentIds
  // }

  get resources(): SourceResources | undefined {
    return this._parent.resources
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
      name: this._sourceLayer.name,
    }
  }
}
