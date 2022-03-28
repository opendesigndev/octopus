import { asBoolean, asNumber } from '@avocode/octopus-common/dist/utils/as'
import { isObject } from '@avocode/octopus-common/dist/utils/common'
import defaults from '../../utils/defaults'
import { parseXDColor } from '../../utils/color'
import SourceEffectDropShadow from '../source/source-effect-drop-shadow'

import type { Octopus } from '../../typings/octopus'
import type { Defined } from '../../typings/helpers'
import type { SourceEffectDropShadowOptions } from '../source/source-effect-drop-shadow'

type OctopusEffectDropShadowOptions = {
  source: SourceEffectDropShadow
}

export default class OctopusEffectDropShadow {
  private _source: SourceEffectDropShadow

  static fromRaw(options: SourceEffectDropShadowOptions): OctopusEffectDropShadow {
    return new this({
      source: new SourceEffectDropShadow(options),
    })
  }

  constructor(options: OctopusEffectDropShadowOptions) {
    this._source = options.source
  }

  convert(): Octopus['EffectDropShadow'] | null {
    const visible = asBoolean(this._source.visible, true)
    const params = this._source.dropShadowParams
    if (!isObject(params)) return null

    const { dx, dy, r, color } = params as Defined<typeof params>

    /**
     * Shadow normalizations from Octopus 2 have been removed
     * because of different positioning model. If necessary, check Octopus 2 code.
     */

    return {
      type: 'DROP_SHADOW',
      visible,
      blendMode: defaults.BLEND_MODE,
      shadow: {
        offset: {
          x: asNumber(dx),
          y: asNumber(dy),
        },
        blur: asNumber(r) * 2,
        choke: defaults.EFFECTS.SHADOW_CHOKE,
        color: parseXDColor(color),
      },
      basis: 'BODY',
    } as const
  }
}
