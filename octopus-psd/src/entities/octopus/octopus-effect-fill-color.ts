import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/color'
import { SourceShapeFill } from '../source/source-effect-fill'

type OctopusFillOptions = {
  fill: SourceShapeFill
}

export class OctopusEffectFillColor {
  protected _fill: SourceShapeFill

  constructor(options: OctopusFillOptions) {
    this._fill = options.fill
  }

  convert(): Octopus['FillColor'] {
    const color = convertColor(this._fill.color)
    return { type: 'COLOR', color }
  }
}
