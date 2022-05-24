import { push } from '@avocode/octopus-common/dist/utils/common'

import { convertBlendMode, convertColor, convertStop } from '../../utils/convert'

import type { Octopus } from '../../typings/octopus'
import type { RawStop } from '../../typings/raw'
import type { SourceLayerCommon } from '../source/source-layer-common'
import type { SourcePaint } from '../source/source-paint'

type OctopusFillOptions = {
  fill: SourcePaint
  parentLayer: SourceLayerCommon
}

export class OctopusEffectFill {
  private _fill: SourcePaint
  private _parentLayer: SourceLayerCommon

  constructor(options: OctopusFillOptions) {
    this._fill = options.fill
    this._parentLayer = options.parentLayer
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
      const newStop = convertStop(stop, this.opacity)
      return newStop ? push(stops, newStop) : stops
    }, [])
  }

  private get _gradient(): Octopus['FillGradient']['gradient'] {
    const type = 'LINEAR' // TODO
    const stops = this._gradientStops
    return { type, stops }
  }

  private get _transformLinear(): Octopus['Transform'] | null {
    const positions = this._fill.gradientHandlePositions
    if (positions === null) return null
    const [SP1, SP2] = positions

    const [_a, _b, _c, _d, offsetX = 0, offsetY = 0] = this._parentLayer.transform ?? []

    const size = this._parentLayer.size
    if (size === null) return null
    const { x: width, y: height } = size

    const p1 = { x: width * SP1.x, y: height * SP1.y }
    const p2 = { x: width * SP2.x, y: height * SP2.y }

    const scaleX = p2.x - p1.x
    const skewY = p2.y - p1.y
    const skewX = p1.y - p2.y
    const scaleY = p2.x - p1.x
    const tx = p1.x + offsetX
    const ty = p1.y + offsetY
    return [scaleX, skewY, skewX, scaleY, tx, ty]
  }

  private get _positioning(): Octopus['FillPositioning'] | null {
    const layout = 'FILL' // TODO
    const origin = 'LAYER' // TODO
    const transform = this._transformLinear
    if (transform === null) return null
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
    if (positioning === null) return null
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
