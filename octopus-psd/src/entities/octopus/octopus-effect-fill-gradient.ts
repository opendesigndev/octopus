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
type TransformLinearParams = { angle: number; scale: number; inverse: boolean; width: number; height: number }

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

  private _mapGradientType(type: SourceFillGradientType | undefined): Octopus['FillGradient']['gradient']['type'] {
    const result = getMapped(type, OctopusEffectFillGradient.FILL_GRADIENT_TYPE_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Fill Gradient type', { type })
      return 'LINEAR'
    }
    return result
  }

  private _mapGradientStop(stop: SourceShapeGradientColor): FillGradientStop {
    const color = convertColor(stop?.color)
    const position = stop.location / 4096
    return { color, position }
  }

  private _mapGradientStops(colors: SourceShapeGradientColor[] = []): Octopus['FillGradient']['gradient']['stops'] {
    return colors.map(this._mapGradientStop)
  }

  private _mapGradient(fill: SourceShapeFill): Octopus['FillGradient']['gradient'] {
    const type = this._mapGradientType(fill?.type)
    const stops = this._mapGradientStops(fill?.gradient.colors)
    return { type, stops }
  }

  private _getTransformLinear({ angle, scale, inverse, width, height }: TransformLinearParams): Octopus['Transform'] {
    const [P1, P2] = getLinearGradientPoints({ angle, inverse })

    const horizontal = scale
    const vertical = (width / height) * scale
    const [SP1, SP2] = scaleLineSegment({ p1: P1, p2: P2, horizontal, vertical, center: { x: 0.5, y: 0.5 } })

    const p1 = { x: width * SP1.x, y: height * SP1.y }
    const p2 = { x: width * SP2.x, y: height * SP2.y }

    const scaleX = p2.x - p1.x
    const skewY = p2.y - p1.y
    const skewX = p1.y - p2.y
    const scaleY = p2.x - p1.x
    const tx = p1.x
    const ty = p1.y

    return [scaleX, skewY, skewX, scaleY, tx, ty]
  }

  private _mapPositioning(layer: SourceLayerShape): Octopus['FillPositioning'] {
    const { width, height } = layer
    const { angle, scale, reverse } = layer.fill

    const transform = this._getTransformLinear({ width, height, scale, angle, inverse: reverse }) // TODO other gradient types

    return {
      layout: 'FILL',
      origin: 'LAYER',
      transform,
    }
  }

  convert(): Octopus['FillGradient'] {
    const gradient = this._mapGradient(this.sourceLayer.fill)
    const positioning = this._mapPositioning(this.sourceLayer)
    return { type: 'GRADIENT', gradient, positioning }
  }
}
