import { asBoolean, asNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { isObject } from '@opendesign/octopus-common/dist/utils/common.js'

import { parseXDColor } from '../../utils/color.js'
import { DEFAULTS } from '../../utils/defaults.js'
import { SourceEffectDropShadow } from '../source/source-effect-drop-shadow.js'

import type { Defined } from '../../typings/helpers.js'
import type { Octopus } from '../../typings/octopus/index.js'
import type { SourceEffectDropShadowOptions } from '../source/source-effect-drop-shadow.js'

type OctopusEffectDropShadowOptions = {
  source: SourceEffectDropShadow
  effectsBasisMissing: boolean
}

export class OctopusEffectDropShadow {
  private _source: SourceEffectDropShadow
  private _effectsBasisMissing: boolean

  static fromRaw(options: SourceEffectDropShadowOptions & { effectsBasisMissing: boolean }): OctopusEffectDropShadow {
    return new this({
      source: new SourceEffectDropShadow(options),
      effectsBasisMissing: options.effectsBasisMissing,
    })
  }

  constructor(options: OctopusEffectDropShadowOptions) {
    this._source = options.source
    this._effectsBasisMissing = options.effectsBasisMissing
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
      blendMode: DEFAULTS.BLEND_MODE,
      shadow: {
        offset: {
          x: asNumber(dx),
          y: asNumber(dy),
        },
        blur: asNumber(r) * 2,
        choke: DEFAULTS.EFFECTS.SHADOW_CHOKE,
        color: parseXDColor(color),
      },
      // basis: this._effectsBasisMissing ? 'BODY' : 'LAYER_AND_EFFECTS', // TODO Clean
      basis: 'BODY' /** @TODO test `BODY` and consult with rendering team */,
    } as const
  }
}
