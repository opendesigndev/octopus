import { asBoolean, asNumber } from '../../utils/as'
import SourceEffectBlur from '../source/source-effect-blur'

import type { Octopus } from '../../typings/octopus'
import type { SourceEffectBlurOptions } from '../source/source-effect-blur'


type OctopusEffectBlurOptions = {
  source: SourceEffectBlur
}

export default class OctopusEffectBlur {
  private _source: SourceEffectBlur

  static fromRaw(options: SourceEffectBlurOptions) {
    return new this({
      source: new SourceEffectBlur(options)
    })
  }

  constructor(options: OctopusEffectBlurOptions) {
    this._source = options.source
  }

  private get filters() {
    if (!this._source.backgroundEffect) return []

    const brightnessFilter = {
      type: 'XD_BRIGHTNESS_ADJUSTMENT',
      visible: true,
      brightness: asNumber(this._source.brightness, 0)
    } as const

    const opacityFilter = {
      type: 'OPACITY_MULTIPLIER',
      visible: true,
      opacity: asNumber(this._source.opacity, 1)
    } as const

    return [ brightnessFilter, opacityFilter ]
  }

  convert(): Octopus['EffectBlur'] {
    const visible = asBoolean(this._source.visible, true)
    const blur = asNumber(this._source.blur)
    const basis = this._source.backgroundEffect ? 'BACKGROUND' : 'BODY'
    const filters = this.filters

    return {
      type: 'BLUR' as const,
      visible,
      blur,
      basis,
      filters
    }  
  }
}