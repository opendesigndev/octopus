import defaults from '../utils/defaults'

import { parseXDColor } from '../utils/color'
import { isObject } from '../utils/common'

import type { RawSolidFill } from '../typings/source'
import type { Octopus } from '../typings/octopus'


type OctopusEffectColorFillOptions = {
  effect: RawSolidFill
}

export default class OctopusEffectColorFill {
  _rawEffect: RawSolidFill

  constructor(options: OctopusEffectColorFillOptions) {
    this._rawEffect = options.effect
  }

  convert(): Octopus['EffectColorFill'] | null {
    const visible = this._rawEffect?.type === 'solid'
    const color = this._rawEffect?.color

    if (!isObject(color)) {
      return null
    }

    return {
      type: 'COLOR_FILL' as const,
      visible,
      blendMode: defaults.BLEND_MODE,
      color: parseXDColor(color)
    }
  }
}