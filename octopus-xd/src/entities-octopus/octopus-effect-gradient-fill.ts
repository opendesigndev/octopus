import defaults from '../utils/defaults'
import { parseXDColor } from '../utils/color'
import { isObject } from '../utils/common'
import { asArray, asNumber } from '../utils/as'
import SourceEffectGradientFill from '../entities-source/source-effect-gradient-fill'

import type SourceResources from '../entities-source/source-resources'
import type { Octopus } from '../typings/octopus'
import type { RawGradientFill, RawGradientResources } from '../typings/source'
import type { Defined } from '../typings/helpers'


type OctopusEffectGradientFillOptions = {
  source: SourceEffectGradientFill,
  resources: SourceResources
}

type OctopusEffectGradientFillFromRawOptions = {
  effect: RawGradientFill,
  resources: SourceResources
}

export default class OctopusEffectGradientFill {
  private _source: SourceEffectGradientFill
  private _resources: SourceResources

  static VALID_GRADIENT_TYPES = [
    'linear'
  ]

  static GRADIENT_MAP = {
    'linear': 'LINEAR'
  } as const

  static fromRaw(options: OctopusEffectGradientFillFromRawOptions) {
    return new this({
      source: new SourceEffectGradientFill({
        effect: options.effect
      }),
      resources: options.resources
    })
  }

  constructor(options: OctopusEffectGradientFillOptions) {
    this._source = options.source
    this._resources = options.resources
  }

  private _isValidGradientType(gradientType: unknown): gradientType is 'linear' {
    return OctopusEffectGradientFill.VALID_GRADIENT_TYPES.includes(gradientType as string)
  }

  private _getGradientResources() {
    const gradientId = this._source.ref

    const resourcesGradient = typeof gradientId === 'undefined'
      ? null
      : this._resources.raw?.resources?.gradients?.[gradientId]

    const localGradient = this._source.gradientResources
    return resourcesGradient || localGradient
  }

  private _getColors(gradient: RawGradientResources): Defined<Octopus['FillGradient']['gradient']['stops']> {
    return asArray(gradient?.stops).map((stop) => {
      const offset = asNumber(stop?.offset, 0)
      const color = stop?.color
      return {
        position: Math.round(offset * 100),
        color: parseXDColor(color)
      }
    })
  }

  /** @TODO radial gradient? */
  convert(): Octopus['FillGradient'] | null {
    const visible = this._source.type !== 'none'
    const gradient = this._getGradientResources()

    if (!isObject(gradient)) return null
    if (!this._isValidGradientType(gradient.type)) return null

    const type = OctopusEffectGradientFill.GRADIENT_MAP[gradient.type]
    const stops = this._getColors(gradient)

    return {
      type: 'GRADIENT',
      visible,
      blendMode: defaults.BLEND_MODE,
      gradient: {
        type,
        stops
      },
      positioning: {
        layout: 'FILL', /** @TODO should it be FILL? */
        origin: 'LAYER',
        transform: [ 1.0, 0.0, 0.0, 1.0, 0.0, 0.0 ] /** @TODO calc later */
      }
    }
  }
}