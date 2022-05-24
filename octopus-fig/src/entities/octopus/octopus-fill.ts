import { push } from '@avocode/octopus-common/dist/utils/common'

import { convertBlendMode, convertColor, convertStop } from '../../utils/convert'

import type { Octopus } from '../../typings/octopus'
import type { RawStop } from '../../typings/raw'
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

  private get _color(): Octopus['Color'] | null {
    return convertColor(this._fill.color, this.opacity)
  }

  private get _gradientStops(): Octopus['GradientColorStop'][] {
    return this._fill.gradientStops.reduce((stops: Octopus['GradientColorStop'][], stop: RawStop) => {
      const newStop = convertStop(stop)
      return newStop ? push(stops, newStop) : stops
    }, [])
  }

  private get _gradient(): Octopus['FillGradient']['gradient'] {
    const type = 'LINEAR' // TODO
    const stops = this._gradientStops
    return { type, stops }
  }

  private get _gradientTransform(): number[] {
    return [1, 0, 0, 1, 100, 100] // TODO
  }

  private get _positioning(): Octopus['FillPositioning'] {
    const layout = 'FILL' // TODO
    const origin = 'LAYER' // TODO
    const transform = this._gradientTransform
    return { layout, origin, transform }
  }

  private get _fillColor(): Octopus['FillColor'] | null {
    const color = this._color
    if (!color) return null
    const visible = this.visible
    const blendMode = this.blendMode
    return { type: 'COLOR', visible, blendMode, color }
  }

  private get _fillGradient(): Octopus['FillGradient'] | null {
    const visible = this.visible
    const blendMode = this.blendMode
    const gradient = this._gradient
    const positioning = this._positioning
    return { type: 'GRADIENT', visible, blendMode, gradient, positioning }
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
