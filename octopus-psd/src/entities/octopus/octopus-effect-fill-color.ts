import type { Octopus } from '../../typings/octopus'
import type { SourceColor } from '../../typings/source'
import { convertColor } from '../../utils/convert'

type OctopusFillOptions = {
  color: SourceColor | null
  opacity?: number
}

export class OctopusEffectFillColor {
  protected _color: SourceColor | null
  protected _opacity: number | undefined

  constructor(options: OctopusFillOptions) {
    this._color = options.color
    this._opacity = options.opacity
  }

  convert(): Octopus['FillColor'] {
    const color = convertColor(this._color, this._opacity)
    return { type: 'COLOR', color }
  }
}
