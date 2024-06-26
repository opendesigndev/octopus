import { asBoolean, asNumber } from '@opendesign/octopus-common/dist/utils/as.js'

import { SourceEffectBlur } from '../source/source-effect-blur.js'

import type { Octopus } from '../../typings/octopus/index.js'
import type { SourceEffectBlurOptions } from '../source/source-effect-blur.js'

type OctopusEffectBlurOptions = {
  source: SourceEffectBlur
}

export class OctopusEffectBlur {
  private _source: SourceEffectBlur

  static fromRaw(options: SourceEffectBlurOptions): OctopusEffectBlur {
    return new this({
      source: new SourceEffectBlur(options),
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
      brightness: asNumber(this._source.brightness, 0),
    } as const

    const opacityFilter = {
      type: 'OPACITY_MULTIPLIER',
      visible: true,
      opacity: asNumber(this._source.opacity, 1),
    } as const

    return [brightnessFilter, opacityFilter]
  }

  convert(): Octopus['EffectBlur'] {
    const visible = asBoolean(this._source.visible, true)
    const blur = asNumber(this._source.blur)
    const basis = this._source.backgroundEffect
      ? 'BACKGROUND'
      : 'LAYER_AND_EFFECTS' /** @TODO test `LAYER_AND_EFFECTS` and consult with rendering team */
    const filters = this.filters

    return {
      type: 'BLUR' as const,
      visible,
      blur,
      basis,
      filters,
    }
  }
}
