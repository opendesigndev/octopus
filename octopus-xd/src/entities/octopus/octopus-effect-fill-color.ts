import { isObject } from '@avocode/octopus-common/dist/utils/common'

import { parseXDColor } from '../../utils/color'
import defaults from '../../utils/defaults'
import SourceEffectFillColor from '../source/source-effect-color-fill'

import type { Octopus } from '../../typings/octopus'
import type { SourceEffectFillColorOptions } from '../source/source-effect-color-fill'

type OctopusEffectFillColorOptions = {
  source: SourceEffectFillColor
}

export default class OctopusEffectFillColor {
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
      blendMode: defaults.BLEND_MODE,
      color: parseXDColor(color),
    }
  }
}
