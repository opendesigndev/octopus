import { v4 as uuidv4 } from 'uuid'

import OctopusXDConverter from '..'
import BLEND_MODES from '../utils/blend-modes'
import { SourceLayer } from '../factories/create-source-layer'
import { asNumber, asString } from '../utils/as'
import { round } from '../utils/common'
import DEFAULTS from '../utils/defaults'
import OctopusArtboard from './octopus-artboard'
import OctopusLayerGroup from './octopus-layer-group'
import { OctopusLayer } from '../factories/create-octopus-layer'
import { convertObjectMatrixToArray } from '../utils/matrix'
import OctopusLayerShape from './octopus-layer-shape'

import { Raw3DMatrix } from '../typings/source'
import OctopusEffects from './octopus-effects-layer'
import { NotNull } from '../typings/helpers'
import OctopusLayerMaskGroup from './octopus-layer-maskgroup'


export type OctopusLayerParent = 
  | OctopusLayerGroup
  | OctopusArtboard
  | OctopusLayerShape
  | OctopusLayerMaskGroup

type OctopusLayerCommonOptions = {
  parent: OctopusLayerParent,
  sourceLayer: SourceLayer
}

export default class OctopusLayerCommon {
  _id: string
  _parent: OctopusLayerParent
  _sourceLayer: SourceLayer

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
    return asString(this._sourceLayer.name, 'Layer')
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

  /**
   * @TODO how to treat 3D matrices?
   */
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
    const types = {
      shape: 'SHAPE',
      group: 'GROUP',
      text: 'TEXT'
    } as const
    const type = String(this._sourceLayer.type).toLowerCase()
    if (!(type in types)) {
      const converter = this.converter
      if (converter) {
        converter.sentry?.captureMessage('Unknown layer type', { extra: { type } })
      }
      return null
      // throw new Error(`Invalid layer property "type": "${this._sourceLayer.type}"`)
    }
    return types[type as keyof typeof types]
  }

  /**
   * @TODO omit `isFixed` or `visible` or similar if missing or has default value?
   */
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

  /**
   * @TODO Im not sure if it should be defined here or on specific layer types.
   */
  effects() {
    return new OctopusEffects({
      sourceLayer: this._sourceLayer
    })
  }

  convertCommon() {
    if (!this.isConvertable()) return null

    const type = this.type as NotNull<typeof this.type>
    const effectsArray = this.effects().convert()
    const effects = effectsArray.length ? { effects: effectsArray } : null

    return {
      id: this.id,
      name: this.name,
      type,
      transform: this.transform,
      visible: this.visible,
      blendMode: this.blendMode,
      opacity: this.opacity,
      // @ts-ignore
      isFixed: this.isFixed, /** @TODO add types for isFixed */
      ...effects
    }
  }
}