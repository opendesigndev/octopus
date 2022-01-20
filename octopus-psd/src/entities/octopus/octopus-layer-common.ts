import { v4 as uuidv4 } from 'uuid'

import type { OctopusPSDConverter } from '../..'
import type { SourceLayer } from '../../factories/create-source-layer'
import { asNumber, asString } from '../../utils/as'
import { OctopusArtboard } from './octopus-artboard'
import type { OctopusLayerGroup } from './octopus-layer-group'
import { NotNull } from '../../typings/helpers'
import type { Octopus } from '../../typings/octopus'
import { round } from '../../utils/common'
import { BLEND_MODES } from '../../utils/blend-modes'
import { DEFAULTS } from '../../utils/defaults'

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

  constructor(options: OctopusLayerCommonOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer
    this._id = asString(this._sourceLayer.id, uuidv4())
  }

  get converter(): OctopusPSDConverter | null {
    const parentArtboard = this.parentArtboard
    if (!parentArtboard) return null
    return parentArtboard.converter
  }

  get parentArtboard(): OctopusArtboard | null {
    if (!this._parent) return null
    const parent = this._parent as OctopusLayerParent
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  //   get parent() {
  //     return this._parent
  //   }

  //   get parents(): (OctopusArtboard | OctopusLayer | OctopusLayerMaskGroup)[] {
  //     const parent = this._parent
  //     if (!parent) return []
  //     return parent instanceof OctopusArtboard ? [parent] : [...parent.parents, parent]
  //   }

  //   get parentLayers(): OctopusLayer[] {
  //     const parent = this._parent
  //     if (!parent || parent instanceof OctopusArtboard) return []
  //     return [...parent.parentLayers, parent]
  //   }

  get id() {
    return this._id
  }

  get name() {
    return asString(this._sourceLayer.name, 'Layer')
  }

  get visible() {
    return typeof this._sourceLayer.visible === 'boolean' ? this._sourceLayer.visible : undefined
  }

  get blendMode(): typeof BLEND_MODES[keyof typeof BLEND_MODES] {
    const sourceBlendMode = this._sourceLayer.blendMode
    return typeof sourceBlendMode === 'string' && sourceBlendMode in BLEND_MODES
      ? BLEND_MODES[sourceBlendMode]
      : DEFAULTS.BLEND_MODE
  }

  protected get layerTranslate() {
    return [0, 0]
  }

  get transform() {
    const [xx, xy, yx, yy] = [...DEFAULTS.LAYER_TRANSFORM]
    return [xx, xy, yx, yy, ...this.layerTranslate]
  }

  get opacity() {
    return round(asNumber(this._sourceLayer.opacity, 100) / 100)
  }

  get type(): 'SHAPE' | 'GROUP' | 'TEXT' | null {
    const types = {
      layerSection: 'GROUP',
      shapeLayer: 'SHAPE',
      textLayer: 'TEXT',
      layer: 'SHAPE',
      // backgroundLayer: 'TODO',
    } as const
    const type = String(this._sourceLayer.type)
    if (!(type in types)) {
      this.converter?.logger?.error('Unknown layer type', { extra: { type } })
      this.converter?.sentry?.captureMessage('Unknown layer type', { extra: { type } })
      return null
    }
    return types[type as keyof typeof types]
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
