import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import { BLEND_MODES } from '../../utils/blend-modes'
import type SourceResources from '../source/source-resources'
import OctopusArtboard from './octopus-artboard'

/** @TODO fix exclusion of `type` from return type after schema update */
export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>

type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent
  sourceLayers: SourceLayer[]
}

export default abstract class OctopusLayerCommon {
  static DEFAULT_OPACITY = 1

  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer

  constructor(options: OctopusLayerCommonOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayers[0]

    this._id = options.sourceLayers[0].path.join(':')
  }

  get parent(): OctopusLayerParent {
    return this._parent
  }

  get id(): string {
    return this._id
  }

  //@todo remove if not neccessary
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

  get parentArtboard(): OctopusArtboard {
    return this._parent instanceof OctopusArtboard ? this._parent : this._parent.parentArtboard
  }

  convertCommon(): Omit<Octopus['LayerBase'], 'type'> {
    return {
      blendMode: this.blendMode,
      opacity: this.opacity,
      id: this.id,
      name: this._sourceLayer.name ?? '',
    }
  }
}
