import { asBoolean, asNumber } from '@avocode/octopus-common/dist/utils/as'
import { isObject } from '@avocode/octopus-common/dist/utils/common'

import { parseXDColor } from '../../utils/color'
import defaults from '../../utils/defaults'
import SourceEffectDropShadow from '../source/source-effect-drop-shadow'

import type { Defined } from '../../typings/helpers'
import type { Octopus } from '../../typings/octopus'
import type { SourceEffectDropShadowOptions } from '../source/source-effect-drop-shadow'

type OctopusEffectDropShadowOptions = {
  source: SourceEffectDropShadow
  effectsBasisMissing: boolean
}

export default class OctopusEffectDropShadow {
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
      // basis: this._effectsBasisMissing ? 'BODY' : 'LAYER_AND_EFFECTS', // TODO Clean
      basis: 'BODY' /** @TODO test `BODY` and consult with rendering team */,
    } as const
  }
}
