import { asString } from '@avocode/octopus-common/dist/utils/as'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import { v4 as uuidv4 } from 'uuid'

import { logWarn } from '../../services/instances/misc'
import { OctopusArtboard } from './octopus-artboard'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerGroup } from './octopus-layer-group'
import type { OctopusLayerMaskGroup } from './octopus-layer-mask-group'
import type { NotNull } from '@avocode/octopus-common/dist/utils/utility-types'

export type OctopusLayerParent = OctopusLayerGroup | OctopusLayerMaskGroup | OctopusArtboard

type OctopusLayerBaseOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
}

export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type' | 'meta'>>

export class OctopusLayerBase {
  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer

  static DEFAULT_TRANSLATION = [0, 0] as const

  static LAYER_TYPE_MAP = {
    FRAME: 'GROUP',
    SHAPE: 'SHAPE',
    TEXT: 'TEXT',
  } as const

  constructor(options: OctopusLayerBaseOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer
    this._id = asString(this._sourceLayer.id, uuidv4())
  }

  get sourceLayer(): SourceLayer {
    return this._sourceLayer
  }

  get parentArtboard(): OctopusArtboard {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return asString(this._sourceLayer.name, 'Layer')
  }

  get visible(): boolean | undefined {
    return typeof this._sourceLayer.visible === 'boolean' ? this._sourceLayer.visible : undefined
  }

  // get blendMode(): Octopus['BlendMode'] {
  //   return convertBlendMode(this._sourceLayer.blendMode)
  // }

  get layerTranslation(): readonly [number, number] {
    return OctopusLayerBase.DEFAULT_TRANSLATION
  }

  // get transform(): number[] {
  //   return createDefaultTranslationMatrix(this.layerTranslation)
  // }

  // get opacity(): number {
  //   return this._sourceLayer.opacity
  // }

  // get fillOpacity(): number {
  //   return this._sourceLayer.fillOpacity
  // }

  get type(): Octopus['LayerBase']['type'] | null {
    const type = String(this._sourceLayer.type)
    const result = getMapped(type, OctopusLayerBase.LAYER_TYPE_MAP, undefined)
    if (!result) {
      logWarn('Unknown Layer type', { type })
      return null
    }
    return result
  }

  get isConvertible(): boolean {
    return this.type !== null
  }

  // @firstCallMemo()
  // get effects(): Octopus['Effect'][] {
  //   return new OctopusEffectsLayer({ parentLayer: this }).convert()
  // }

  convertBase(): Octopus['LayerBase'] | null {
    if (!this.isConvertible) return null

    const type = this.type as NotNull<typeof this.type>

    return {
      id: this.id,
      name: this.name,
      type,
      // transform: this.transform,
      visible: this.visible,
      // blendMode: this.blendMode,
      // opacity: this.opacity,
      // effects: this.effects,
    }
  }
}
