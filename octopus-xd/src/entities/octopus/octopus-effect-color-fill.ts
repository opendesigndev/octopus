import defaults from '../../utils/defaults'

import { parseXDColor } from '../../utils/color'
import { isObject } from '../../utils/common'
import SourceEffectColorFill from '../source/source-effect-color-fill'

import type { SourceEffectColorFillOptions } from '../source/source-effect-color-fill'
import type { Octopus } from '../../typings/octopus'


type OctopusEffectColorFillOptions = {
  source: SourceEffectColorFill
}

export default class OctopusEffectColorFill {
  private _source: SourceEffectColorFill

  static fromRaw(options: SourceEffectColorFillOptions) {
    return new this({
      source: new SourceEffectColorFill(options)
    })
  }

  constructor(options: OctopusEffectColorFillOptions) {
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
      color: parseXDColor(color)
    }
  }
}