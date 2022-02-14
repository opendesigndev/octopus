import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/color'
import { SourceEffectFill } from '../source/source-effect-fill'

type OctopusFillOptions = {
  fill: SourceEffectFill
}

export class OctopusEffectFillColor {
  protected _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    this._fill = options.fill
  }

  convert(): Octopus['FillColor'] {
    const color = convertColor(this._fill.color)
    return { type: 'COLOR', color }
  }
}
