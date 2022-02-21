/* eslint-disable @typescript-eslint/ban-ts-comment */
import type SourceResources from '../entities-source/source-resources'
import type { SourceLayer } from '../factories/create-source-layer'
import type { Octopus } from '../typings/octopus'
import type { OctopusLayerParent } from '../typings/octopus-entities'

/** @TODO fix exclusion of `type` from return type after schema update */
export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>

type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
}

export default class OctopusLayerCommon {
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
    return this._sourceLayer.opacity ?? 1
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
