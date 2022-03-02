/* eslint-disable @typescript-eslint/ban-ts-comment */
import type SourceResources from '../source/source-resources'
import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'

/** @TODO fix exclusion of `type` from return type after schema update */
export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>

// export default {
//   'pass-through': 'PASS_THROUGH',
//   Normal: 'NORMAL', // updated
//   darken: 'DARKEN',
//   multiply: 'MULTIPLY',
//   'color-burn': 'COLOR_BURN',
//   lighten: 'LIGHTEN',
//   screen: 'SCREEN',
//   'color-dodge': 'COLOR_DODGE',
//   overlay: 'OVERLAY',
//   'soft-light': 'SOFT_LIGHT',
//   'hard-light': 'HARD_LIGHT',
//   difference: 'DIFFERENCE',
//   exclusion: 'EXCLUSION',
//   hue: 'HUE',
//   saturation: 'SATURATION',
//   color: 'COLOR',
//   luminosity: 'LUMINOSITY',
// } as const

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
    const blendMode = this._sourceLayer.blendMode
    if (!blendMode) {
      return 'NORMAL'
    }

    return blendMode
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
