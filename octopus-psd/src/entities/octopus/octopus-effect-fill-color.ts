import type { Octopus } from '../../typings/octopus'
import type { SourceColor } from '../../typings/source'
import { convertColor } from '../../utils/convert'

type OctopusFillOptions = {
  color: SourceColor | null
}

export class OctopusEffectFillColor {
  protected _color: SourceColor | null

  constructor(options: OctopusFillOptions) {
    this._color = options.color
  }

  convert(): Octopus['FillColor'] {
    const color = convertColor(this._color)
    return { type: 'COLOR', color }
  }
}
