import { v4 as uuidv4 } from 'uuid'

import BLEND_MODES from '../utils/blend-modes'
import { asNumber, asString } from '../utils/as'
import { round } from '../utils/common'
import DEFAULTS from '../utils/defaults'
import OctopusArtboard from './octopus-artboard'
import { convertObjectMatrixToArray } from '../utils/matrix'
import OctopusEffectsLayer from './octopus-effects-layer'
import defaults from '../utils/defaults'

import type OctopusXDConverter from '..'
import type OctopusLayerGroup from './octopus-layer-group'
import type OctopusLayerMaskGroup from './octopus-layer-maskgroup'
import type { SourceLayer } from '../factories/create-source-layer'
import type { OctopusLayer } from '../factories/create-octopus-layer'
import type { Raw3DMatrix } from '../typings/source'
import type { Octopus } from '../typings/octopus'
import type { OctopusLayerParent } from '../typings/octopus-entities'


type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent,
  sourceLayer: SourceLayer
}

/** @TODO fix exclusion of `type` from return type after schema update */
export type LayerSpecifics<T> = Omit<T, Exclude<keyof Octopus['LayerBase'], 'type'>>
export default class OctopusLayerCommon {
  protected _id: string
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayer

  static LAYER_TYPES = {
    shape: 'SHAPE',
    group: 'GROUP',
    text: 'TEXT'
  } as const

  constructor(options: OctopusLayerCommonOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer

    this._id = asString(this._sourceLayer.id, uuidv4())
  }

  get converter(): OctopusXDConverter | null {
    const parentArtboard = this.parentArtboard
    if (!parentArtboard) return null
    return parentArtboard.converter
  }

  get parentArtboard(): OctopusArtboard | null {
    if (!this._parent) return null
    const parent = this._parent as OctopusLayerGroup | OctopusArtboard
    return parent instanceof OctopusArtboard ? parent : parent.parentArtboard
  }

  get parent() {
    return this._parent
  }

  get parents(): (OctopusArtboard | OctopusLayer | OctopusLayerMaskGroup)[] {
    const parent = this._parent
    if (!parent) return []
    return parent instanceof OctopusArtboard
      ? [ parent ]
      : [ ...parent.parents, parent ]
  }

  get parentLayers(): OctopusLayer[] {
    const parent = this._parent
    if (!parent || parent instanceof OctopusArtboard) return []
    return [ ...parent.parentLayers, parent ]
  }

  get id() {
    return this._id
  }

  get name() {
    return asString(this._sourceLayer.name, defaults.LAYER.NAME)
  }

  get visible() {
    return typeof this._sourceLayer.visible === 'boolean'
      ? this._sourceLayer.visible
      : undefined
  }

  get blendMode(): typeof BLEND_MODES[keyof typeof BLEND_MODES] {
    const sourceBlendMode = this._sourceLayer.blendMode
    return typeof sourceBlendMode === 'string' && (sourceBlendMode in BLEND_MODES)
      ? BLEND_MODES[sourceBlendMode]
      : DEFAULTS.BLEND_MODE
  }

  get transform() {
    if (!this._sourceLayer.transform) {
      return DEFAULTS.LAYER_TRANSFORM.slice()
    }
    const matrixAsArray = convertObjectMatrixToArray(this._sourceLayer.transform)
    return matrixAsArray || DEFAULTS.LAYER_TRANSFORM.slice()
  }

  get opacity() {
    return round(asNumber(this._sourceLayer.opacity, 1))
  }

  get type(): 'SHAPE' | 'GROUP' | 'TEXT' | null {
    const type = String(this._sourceLayer.type).toLowerCase()
    if (!(type in OctopusLayerCommon.LAYER_TYPES)) {
      const converter = this.converter
      if (converter) {
        converter.sentry?.captureMessage('Unknown layer type', { extra: { type } })
      }
      return null
      // throw new Error(`Invalid layer property "type": "${this._sourceLayer.type}"`)
    }
    return OctopusLayerCommon.LAYER_TYPES[type as keyof typeof OctopusLayerCommon.LAYER_TYPES]
  }

  get isFixed() {
    return typeof this._sourceLayer.fixed === 'boolean'
      ? this._sourceLayer.fixed
      : undefined
  }

  has3dMatrix() {
    return typeof (this._sourceLayer.transform as Raw3DMatrix)?.[0]?.[0] === 'number'
  }

  isConvertable() {
    const hasValidType = this.type !== null
    const has3dMatrix = this.has3dMatrix()
    return hasValidType && !has3dMatrix
  }

  effects() {
    return new OctopusEffectsLayer({
      sourceLayer: this._sourceLayer
    })
  }

  convertCommon() {
    if (!this.isConvertable()) return null

    const effectsArray = this.effects().convert()
    const effects = effectsArray.length ? { effects: effectsArray } : null

    return {
      id: this.id,
      name: this.name,
      transform: this.transform,
      visible: this.visible,
      blendMode: this.blendMode,
      opacity: this.opacity,
      ...effects
    }
  }
}