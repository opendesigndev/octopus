import { isObject } from '@avocode/octopus-common/dist/utils/common'

import { parseXDColor } from '../../utils/color.js'
import { DEFAULTS } from '../../utils/defaults.js'
import { SourceEffectFillColor } from '../source/source-effect-color-fill.js'

import type { Octopus } from '../../typings/octopus/index.js'
import type { SourceEffectFillColorOptions } from '../source/source-effect-color-fill.js'

type OctopusEffectFillColorOptions = {
  source: SourceEffectFillColor
}

export class OctopusEffectFillColor {
  private _source: SourceEffectFillColor

  static fromRaw(options: SourceEffectFillColorOptions): OctopusEffectFillColor {
    return new this({
      source: new SourceEffectFillColor(options),
    })
  }

  constructor(options: OctopusEffectFillColorOptions) {
    this._source = options.source
  }

  convert(): Octopus['FillColor'] | null {
    const visible = this._source?.type === 'solid'
    const color = this._source?.color

    if (!isObject(color)) {
      return null
    }

    return {
      type: 'COLOR' as const,
      visible,
      blendMode: DEFAULTS.BLEND_MODE,
      color: parseXDColor(color),
    }
  }
}
