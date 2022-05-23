import { convertBlendMode, convertColor } from '../../utils/convert'

import type { Octopus } from '../../typings/octopus'
import type { SourcePaint } from '../source/source-paint'

type OctopusFillOptions = {
  fill: SourcePaint
}

export class OctopusEffectFill {
  private _fill: SourcePaint

  constructor(options: OctopusFillOptions) {
    this._fill = options.fill
  }

  get fillType(): Octopus['FillType'] | null {
    switch (this._fill.type) {
      case 'SOLID':
        return 'COLOR'
      case 'GRADIENT_LINEAR':
      case 'GRADIENT_RADIAL':
      case 'GRADIENT_ANGULAR':
      case 'GRADIENT_DIAMOND':
        return 'GRADIENT'
      case 'IMAGE':
        return 'IMAGE'
      default:
        return null
    }
  }

  get visible(): boolean {
    return this._fill.visible
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._fill.blendMode)
  }

  get opacity(): number {
    return this._fill.opacity
  }

  get _color(): Octopus['Color'] | null {
    return convertColor(this._fill.color, this.opacity)
  }

  private get _fillColor(): Octopus['FillColor'] | null {
    const color = this._color
    if (!color) return null
    const visible = this.visible
    const blendMode = this.blendMode
    return { type: 'COLOR', visible, blendMode, color }
  }

  private get _fillGradient(): Octopus['FillGradient'] | null {
    return null // TODO
  }

  private get _fillImage(): Octopus['FillImage'] | null {
    return null // TODO
  }

  convert(): Octopus['Fill'] | null {
    switch (this.fillType) {
      case 'COLOR':
        return this._fillColor
      case 'GRADIENT':
        return this._fillGradient
      case 'IMAGE':
        return this._fillImage
      default:
        return null
    }
  }
}
