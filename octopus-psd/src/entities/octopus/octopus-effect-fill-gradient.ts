import type { ElementOf } from '../../typings/helpers'
import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/color'
import { getMapped } from '../../utils/common'
import type { SourceShapeFill, SourceShapeGradientColor } from '../source/shape-fill'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourceFillGradientType } from '../source/types'
import { getLinearGradientPoints, scaleLineSegment } from '../../utils/gradient'
import { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

type FillGradientStop = ElementOf<Octopus['FillGradient']['gradient']['stops']>

type OctopusFillGradientOptions = {
  parent: OctopusLayerShapeShapeAdapter
}

export class OctopusEffectFillGradient {
  protected _parent: OctopusLayerShapeShapeAdapter

  static FILL_GRADIENT_TYPE_MAP = {
    linear: 'LINEAR',
    radial: 'RADIAL',
    Angl: 'ANGULAR',
    Dmnd: 'DIAMOND',
  } as const

  constructor(options: OctopusFillGradientOptions) {
    this._parent = options.parent
  }

  get sourceLayer(): SourceLayerShape {
    return this._parent.sourceLayer
  }

  get type(): Octopus['FillGradient']['gradient']['type'] {
    const type: SourceFillGradientType | undefined = this.sourceLayer.fill.type
    const result = getMapped(type, OctopusEffectFillGradient.FILL_GRADIENT_TYPE_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Fill Gradient type', { type })
      return 'LINEAR'
    }
    return result
  }

  private _getGradientStop(stop: SourceShapeGradientColor): FillGradientStop {
    const color = convertColor(stop?.color)
    const position = stop.location / 4096
    return { color, position }
  }

  private _getGradientStops(colors: SourceShapeGradientColor[] = []): Octopus['FillGradient']['gradient']['stops'] {
    return colors.map(this._getGradientStop)
  }

  private _getGradient(): Octopus['FillGradient']['gradient'] {
    const fill: SourceShapeFill = this.sourceLayer.fill
    const type = this.type
    const stops = this._getGradientStops(fill?.gradient.colors)
    return { type, stops }
  }

  private get _transformAlignParams() {
    const layer = this.sourceLayer
    const align = layer.fill.align
    if (align) {
      const { width, height } = layer.dimensions
      return { width, height, boundTx: 0, boundTy: 0 }
    }
    const { width, height } = this._parent.parentArtboard.dimensions
    const { left, top } = layer.bounds
    return { width, height, boundTx: left, boundTy: top }
  }

  private get _transformLinear(): Octopus['Transform'] {
    const layer: SourceLayerShape = this.sourceLayer
    const { angle, scale, reverse } = layer.fill
    const { width, height, boundTx, boundTy } = this._transformAlignParams

    const [P1, P2] = getLinearGradientPoints({ angle, inverse: reverse })

    const horizontal = scale
    const vertical = (width / height) * scale
    const [SP1, SP2] = scaleLineSegment({ p1: P1, p2: P2, horizontal, vertical, center: { x: 0.5, y: 0.5 } })

    const p1 = { x: width * SP1.x, y: height * SP1.y }
    const p2 = { x: width * SP2.x, y: height * SP2.y }

    const scaleX = p2.x - p1.x
    const skewY = p2.y - p1.y
    const skewX = p1.y - p2.y
    const scaleY = p2.x - p1.x
    const tx = p1.x - boundTx
    const ty = p1.y - boundTy

    return [scaleX, skewY, skewX, scaleY, tx, ty]
  }

  private get _transformRadial(): Octopus['Transform'] {
    // TODO
    // TODO
    // TODO
    return [1, 0, 0, 1, 0, 0]
  }

  private _getPositioning(): Octopus['FillPositioning'] {
    const type = this.type
    const transform = type === 'RADIAL' || type === 'ANGULAR' ? this._transformRadial : this._transformLinear

    return {
      layout: 'FILL',
      origin: 'LAYER',
      transform,
    }
  }

  convert(): Octopus['FillGradient'] {
    const gradient = this._getGradient()
    const positioning = this._getPositioning()
    return { type: 'GRADIENT', gradient, positioning }
  }
}
