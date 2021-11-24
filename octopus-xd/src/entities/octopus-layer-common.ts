import { v4 as uuidv4 } from 'uuid'

import OctopusXDConverter from '..'
import BLEND_MODES from '../utils/blend-modes'
import { SourceLayer } from '../factories/source-layer'
import { asBoolean, asNumber, asString } from '../utils/as'
import { isObject, round } from '../utils/common'
import DEFAULTS from '../utils/defaults'
import OctopusArtboard from './octopus-artboard'
import OctopusLayerGroup from './octopus-layer-group'


type OctopusLayerCommonOptions = {
  parent: OctopusLayerGroup | OctopusArtboard,
  sourceLayer: SourceLayer
}

export default class OctopusLayerCommon {
  _id: string
  _parent: OctopusLayerGroup | OctopusArtboard
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

  get blendMode() {
    const sourceBlendMode = this._sourceLayer.blendMode
    return typeof sourceBlendMode === 'string' && (sourceBlendMode in BLEND_MODES)
      ? BLEND_MODES[sourceBlendMode]
      : DEFAULTS.BLEND_MODE
  }

  /**
   * @TODO how to treat 4D matrices?
   */
  get transform() {
    return isObject(this._sourceLayer.transform)
      ? this._sourceLayer.transform
      : DEFAULTS.LAYER_TRANSFORM
  }

  get opacity() {
    return round(asNumber(this._sourceLayer.opacity, 1))
  }

  get type(): 'SHAPE' | 'GROUP' | null {
    const types = {
      shape: 'SHAPE' as 'SHAPE',
      group: 'GROUP' as 'GROUP'
    }
    const type = String(this._sourceLayer.type).toLowerCase()
    if (!(type in types)) {
      const converter = this.converter
      if (converter) {
        converter.sentry?.captureMessage('Unknown layer type', {
          extra: {
            type: type
          }
        })
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

  isConvertable() {
    const hasValidType = this.type !== null
    const has3dMatrix = typeof this.transform?.a === 'number'

    return hasValidType && has3dMatrix
  }

  convertTypeSpecific() {
    return {}
  }

  convert() {
    if (!this.isConvertable()) return null

    return {
      id: this.id,
      name: this.name,
      type: this.type,
      transform: this.transform,
      visible: this.visible,
      blendMode: this.blendMode,
      opacity: this.opacity,
      isFixed: this.isFixed,
      ...this.convertTypeSpecific()
    }
  }
}