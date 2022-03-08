import type { ElementOf } from '@avocode/octopus-common/dist/utils/utility-types'
import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/convert'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import type { SourceEffectFill } from '../source/source-effect-fill'
import type { SourceBounds, SourceGradientType } from '../../typings/source'
import { scaleLineSegment, angleToPoints } from '../../utils/gradient'
import { createLine, createPathEllipse, createPoint, createSize } from '../../utils/paper-factories'
import type { SourceEffectFillGradientColor } from '../source/source-effect-fill-gradient-color'
import { logWarn } from '../../services/instances/misc'
import type { OctopusArtboard } from './octopus-artboard'
import type { OctopusLayerBase } from './octopus-layer-base'

type FillGradientStop = ElementOf<Octopus['FillGradient']['gradient']['stops']>

type OctopusFillGradientOptions = {
  parentLayer: OctopusLayerBase
  fill: SourceEffectFill
}

export class OctopusEffectFillGradient {
  protected _parentLayer: OctopusLayerBase
  protected _fill: SourceEffectFill

  static GRADIENT_TYPE_MAP = {
    linear: 'LINEAR',
    radial: 'RADIAL',
    Angl: 'ANGULAR',
    Dmnd: 'DIAMOND',
  } as const

  constructor(options: OctopusFillGradientOptions) {
    this._parentLayer = options.parentLayer
    this._fill = options.fill
  }

  private get _parentArtboard(): OctopusArtboard {
    return this._parentLayer.parentArtboard
  }

  private get _sourceLayerBounds(): SourceBounds {
    return this._parentLayer.sourceLayer.bounds
  }

  get fill(): SourceEffectFill {
    return this._fill
  }

  get type(): Octopus['FillGradient']['gradient']['type'] | null {
    const type: SourceGradientType | undefined = this.fill.type
    const result = getMapped(type, OctopusEffectFillGradient.GRADIENT_TYPE_MAP, undefined)
    if (!result) {
      logWarn('Unknown Fill Gradient type', { type })
      return null
    }
    return result
  }

  get isInverse(): boolean {
    return this.fill.reverse
  }

  private _getGradientStop(stop: SourceEffectFillGradientColor): FillGradientStop {
    const STOP_MAX_LOCATION = 4096
    const color = convertColor(stop?.color, this._fill.opacity)
    const location = this.isInverse ? STOP_MAX_LOCATION - stop.location : stop.location
    const position = location / STOP_MAX_LOCATION
    return { color, position }
  }

  private get _gradientStops(): Octopus['FillGradient']['gradient']['stops'] {
    const colors: SourceEffectFillGradientColor[] = this.fill.gradient?.colors ?? []

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
      const { width, height } = this._sourceLayerBounds
      return { width, height, boundTx: 0, boundTy: 0 }
    }
    const { width, height } = this._parentArtboard.dimensions
    const { left, top } = this._sourceLayerBounds
    return { width, height, boundTx: left, boundTy: top }
  }

  private get _transformLinear(): Octopus['Transform'] {
    const { angle, scale } = this.fill
    const { width, height, boundTx, boundTy } = this._transformAlignParams
    const offset = this.fill.offset(width, height)

    const [P1, P2] = angleToPoints({ angle, width, height })
    const [SP1, SP2] = scaleLineSegment({ p1: P1, p2: P2, scaleX: scale, scaleY: scale, center: { x: 0.5, y: 0.5 } })

    const p1 = { x: width * SP1.x, y: height * SP1.y }
    const p2 = { x: width * SP2.x, y: height * SP2.y }

    const scaleX = p2.x - p1.x
    const skewY = p2.y - p1.y
    const skewX = p1.y - p2.y
    const scaleY = p2.x - p1.x
    const tx = p1.x - boundTx + offset.x
    const ty = p1.y - boundTy + offset.y
    return [scaleX, skewY, skewX, scaleY, tx, ty]
  }

  private get _transformRadial(): Octopus['Transform'] {
    const { angle, scale } = this.fill
    const { width, height, boundTx, boundTy } = this._transformAlignParams
    const offset = this.fill.offset(width, height)

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
    const tx = p1.x - boundTx + offset.x
    const ty = p1.y - boundTy + offset.y
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
