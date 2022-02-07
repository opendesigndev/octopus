import { v4 as uuidv4 } from 'uuid'

import type { OctopusPSDConverter } from '../..'
import type { SourceLayer } from '../../factories/create-source-layer'
import { asNumber, asString } from '../../utils/as'
import { OctopusArtboard } from './octopus-artboard'
import type { OctopusLayerGroup } from './octopus-layer-group'
import { NotNull } from '../../typings/helpers'
import type { Octopus } from '../../typings/octopus'
import { getMapped, round } from '../../utils/common'
import { BLEND_MODES } from '../../utils/blend-modes'
import { DEFAULTS } from '../../utils/defaults'
import { createDefaultTranslationMatrix } from '../../utils/path'

export type OctopusLayerParent = OctopusLayerGroup | OctopusArtboard

type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayer
}

export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>

export class OctopusLayerCommon {
  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer

  static LAYER_TYPE_MAP = {
    layerSection: 'GROUP',
    shapeLayer: 'SHAPE',
    textLayer: 'TEXT',
    layer: 'SHAPE',
    // backgroundLayer: 'TODO',
  } as const

  constructor(options: OctopusLayerCommonOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer
    this._id = asString(this._sourceLayer.id, uuidv4())
  }

  get converter(): OctopusPSDConverter {
    const parentArtboard = this.parentArtboard
    return parentArtboard.converter
  }

  get parentArtboard(): OctopusArtboard {
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  get id() {
    return this._id
  }

  get name() {
    return asString(this._sourceLayer.name, 'Layer')
  }

  get visible() {
    return typeof this._sourceLayer.visible === 'boolean' ? this._sourceLayer.visible : undefined
  }

  get blendMode(): Octopus['BlendMode'] {
    const sourceBlendMode = this._sourceLayer.blendMode
    return typeof sourceBlendMode === 'string' && sourceBlendMode in BLEND_MODES
      ? BLEND_MODES[sourceBlendMode]
      : DEFAULTS.BLEND_MODE
  }

  get layerTranslation(): [number, number] {
    return [0, 0]
  }

  get transform() {
    return createDefaultTranslationMatrix(this.layerTranslation)
  }

  get opacity() {
    return round(asNumber(this._sourceLayer.opacity, 100) / 100)
  }

  get type(): Octopus['LayerBase']['type'] | null {
    const type = String(this._sourceLayer.type)
    const result = getMapped(type, OctopusLayerCommon.LAYER_TYPE_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Layer type', { type })
      return null
    }
    return result
  }

  get isConvertible() {
    return this.type !== null
  }

  //   /**
  //    * @TODO Im not sure if it should be defined here or on specific layer types.
  //    */
  //   effects() {
  //     return new OctopusEffects({
  //       sourceLayer: this._sourceLayer,
  //     })
  //   }

  convertCommon() {
    if (!this.isConvertible) return null

    const type = this.type as NotNull<typeof this.type>
    // const effectsArray = this.effects().convert()
    // const effects = effectsArray.length ? { effects: effectsArray } : null

    return {
      id: this.id,
      name: this.name,
      type,
      transform: this.transform,
      visible: this.visible,
      blendMode: this.blendMode,
      opacity: this.opacity,
      // ...effects,
    }
  }
}
