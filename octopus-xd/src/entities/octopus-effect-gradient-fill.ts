import defaults from '../utils/defaults'

import { parseXDColor } from '../utils/color'
import { isObject } from '../utils/common'

import type { Octopus } from '../typings/octopus'
import { RawGradientFill, RawGradientResources } from '../typings/source'
import SourceResources from './source-resources'
import { Defined } from '../typings/helpers'
import { asArray, asNumber, asString } from '../utils/as'


type OctopusEffectGradientFillOptions = {
  effect: RawGradientFill,
  resources: SourceResources
}

export default class OctopusEffectGradientFill {
  _rawEffect: RawGradientFill
  _resources: SourceResources

  static VALID_GRADIENT_TYPES = [
    'linear'
  ]

  static GRADIENT_MAP = {
    'linear': 'LINEAR'
  } as const

  constructor(options: OctopusEffectGradientFillOptions) {
    this._rawEffect = options.effect
    this._resources = options.resources
  }

  _isValidGradientType(gradientType: unknown): gradientType is 'linear' {
    return OctopusEffectGradientFill.VALID_GRADIENT_TYPES.includes(gradientType as string)
  }

  _getGradientResources() {
    const gradientId = this._rawEffect?.gradient?.ref

    const resourcesGradient = typeof gradientId === 'undefined'
      ? null
      : this._resources.raw?.resources?.gradients?.[gradientId]

    const localGradient = this._rawEffect?.gradient?.meta?.ux?.gradientResources
    return resourcesGradient || localGradient
  }

  _getColors(gradient: RawGradientResources): Defined<Octopus['EffectGradientFill']['gradient']['colors']> {
    return asArray(gradient?.stops).map((stop) => {
      const offset = asNumber(stop?.offset, 0)
      const color = stop?.color
      return {
        position: Math.round(offset * 100),
        interpolation: 'LINEAR', /** @TODO interpolation-related props should be optional? */
        interpolationParameter: 0,
        color: parseXDColor(color)
      }
    })
  }

  /**
   * @TODO colors instead of stops??
   * radial gradient?
   */

  convert(): Octopus['EffectGradientFill'] | null {
    const visible = this._rawEffect?.type !== 'none'
    const gradient = this._getGradientResources()

    if (!isObject(gradient)) return null
    if (!this._isValidGradientType(gradient.type)) return null

    const type = OctopusEffectGradientFill.GRADIENT_MAP[gradient.type]
    const colors = this._getColors(gradient)

    return {
      type: 'GRADIENT_FILL',
      visible,
      blendMode: defaults.BLEND_MODE,
      gradient: {
        type,
        colors
      },
      positioning: {
        layout: 'FILL', /** @TODO should it be FILL? */
        origin: 'LAYER',
        transform: [ 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 ] /** @TODO calc later */
      }
    }
  }
}