import { RawEffectDropShadow } from '../typings/source'
import { asBoolean, asNumber } from '../utils/as'
import { isObject } from '../utils/common'

import type { Octopus } from '../typings/octopus'
import defaults from '../utils/defaults'
import { parseXDColor } from '../utils/color'
import { Defined } from '../typings/helpers'


type OctopusEffectDropShadowOptions = {
  effect: RawEffectDropShadow
}

export default class OctopusEffectDropShadow {
  _rawEffect: RawEffectDropShadow

  constructor(options: OctopusEffectDropShadowOptions) {
    this._rawEffect = options.effect
  }

  convert(): Octopus['EffectDropShadow'] | null {
    const visible = asBoolean(this._rawEffect?.visible, true)
    const params = this._rawEffect?.params?.dropShadows?.[0]
    if (!isObject(params)) return null

    const {dx, dy, r, color} = params as Defined<typeof params>

    /**
     * Shadow normalizations from Octopus 2 have been removed
     * because of different positioning model. If necessary, check Octopus 2 code.
     */

    return {
      type: 'DROP_SHADOW' as const,
      visible,
      blendMode: defaults.BLEND_MODE,
      shadow: {
        offset: {
          x: asNumber(dx),
          y: asNumber(dy)
        },
        blur: asNumber(r) * 2,
        choke: defaults.EFFECTS.SHADOW_CHOKE,
        color: parseXDColor(color)
      }
    }
  }
}