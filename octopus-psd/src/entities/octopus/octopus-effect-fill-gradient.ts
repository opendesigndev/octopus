import type { ElementOf } from '@avocode/octopus-common/dist/utils/utility-types'
import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/color'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import type { SourceShapeFill, SourceShapeGradientColor } from '../source/source-effect-fill'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourceGradientType } from '../../typings/source'
import { scaleLineSegment, angleToPoints } from '../../utils/gradient'
import { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { createLine, createPathEllipse, createPoint, createSize } from '../../utils/paper-factories'

type FillGradientStop = ElementOf<Octopus['FillGradient']['gradient']['stops']>

type OctopusFillGradientOptions = {
  parent: OctopusLayerShapeShapeAdapter
  fill: SourceShapeFill
}

export class OctopusEffectFillGradient {
  protected _parent: OctopusLayerShapeShapeAdapter
  protected _fill: SourceShapeFill

  static GRADIENT_TYPE_MAP = {
    linear: 'LINEAR',
    radial: 'RADIAL',
    Angl: 'ANGULAR',
    Dmnd: 'DIAMOND',
  } as const

  constructor(options: OctopusFillGradientOptions) {
    this._parent = options.parent
    this._fill = options.fill
  }

  get sourceLayer(): SourceLayerShape {
    return this._parent.sourceLayer
  }

  get fill(): SourceShapeFill {
    return this._fill
  }

  get type(): Octopus['FillGradient']['gradient']['type'] | null {
    const type: SourceGradientType | undefined = this.fill.type
    const result = getMapped(type, OctopusEffectFillGradient.GRADIENT_TYPE_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Fill Gradient type', { type })
      return null
    }
    return result
  }

  get isInverse() {
    return this.fill.reverse
  }

  private _getGradientStop(stop: SourceShapeGradientColor): FillGradientStop {
    const STOP_MAX_LOCATION = 4096
    const color = convertColor(stop?.color)
    const location = this.isInverse ? STOP_MAX_LOCATION - stop.location : stop.location
    const position = location / STOP_MAX_LOCATION
    return { color, position }
  }

  private get _gradientStops(): Octopus['FillGradient']['gradient']['stops'] {
    const colors: SourceShapeGradientColor[] = this.fill.gradient?.colors ?? []

    // TODO: Add midpoints
    // TODO: Fix for multiple stops at the same location (filter for start/end)

    const stops = this.isInverse ? [...colors].reverse() : colors
    return stops.map((stop) => this._getGradientStop(stop))
  }

  private _getGradient(type: Octopus['FillGradient']['gradient']['type']): Octopus['FillGradient']['gradient'] {
    const stops = this._gradientStops
    return { type, stops }
  }

  private get _transformAlignParams() {
    if (this.fill.align) {
      const { width, height } = this.sourceLayer.bounds
      return { width, height, boundTx: 0, boundTy: 0 }
    }
    const { width, height } = this._parent.parentArtboard.dimensions
    const { left, top } = this.sourceLayer.bounds
    return { width, height, boundTx: left, boundTy: top }
  }

  private get _transformLinear(): Octopus['Transform'] {
    const { angle, scale } = this.fill
    const { width, height, boundTx, boundTy } = this._transformAlignParams

    const [P1, P2] = angleToPoints({ angle, width, height })
    const [SP1, SP2] = scaleLineSegment({ p1: P1, p2: P2, scaleX: scale, scaleY: scale, center: { x: 0.5, y: 0.5 } })

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
    const { angle, scale } = this.fill
    const { width, height, boundTx, boundTy } = this._transformAlignParams

    const [P1, P2] = angleToPoints({ angle, width, height })
    const [SP1, SP2] = scaleLineSegment({
      p1: P1,
      p2: P2,
      scaleX: scale * width,
      scaleY: scale * height,
      center: { x: 0.5, y: 0.5 },
    })

    const line = createLine(createPoint(SP1.x, SP1.y), createPoint(SP2.x, SP2.y))
    const size = line.length

    const centerPoint = createPoint(width / 2, height / 2)
    const oval = createPathEllipse(createPoint(0, 0), createSize(size))
    oval.position = centerPoint
    const [, , s2, s3] = oval.segments.map((seg) => seg.point)
    const [p1, p2, p3] = [centerPoint, s2, s3]

    const scaleX = p2.x - p1.x
    const skewY = p2.y - p1.y
    const skewX = p3.x - p1.x
    const scaleY = p3.y - p1.y
    const tx = p1.x - boundTx
    const ty = p1.y - boundTy
    return [scaleX, skewY, skewX, scaleY, tx, ty]
  }

  private _getPositioning(): Octopus['FillPositioning'] {
    const type = this.type
    const transform = type === 'LINEAR' ? this._transformLinear : this._transformRadial
    return {
      layout: 'FILL',
      origin: 'LAYER',
      transform,
    }
  }

  convert(): Octopus['FillGradient'] | null {
    const type = this.type
    if (type === null) return null

    const gradient = this._getGradient(type)
    const positioning = this._getPositioning()

    return { type: 'GRADIENT', gradient, positioning }
  }
}
