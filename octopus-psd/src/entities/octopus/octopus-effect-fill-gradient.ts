import { lerpColor, multiplyAlpha } from '@avocode/octopus-common/dist/utils/color'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import { invLerp, lerp } from '@avocode/octopus-common/dist/utils/math'
import uniq from 'lodash/uniq'

import { logWarn } from '../../services/instances/misc'
import { convertColor, convertOffset } from '../../utils/convert'
import { angleToPoints, scaleLineSegment } from '../../utils/gradient'
import { createLine, createPathEllipse, createPoint, createSize } from '../../utils/paper-factories'

import type { Octopus } from '../../typings/octopus'
import type { SourceBounds, SourceGradientType } from '../../typings/source'
import type { SourceEffectFill } from '../source/source-effect-fill'
import type { SourceEffectFillGradientColor } from '../source/source-effect-fill-gradient-color'
import type { SourceEffectFillGradientOpacity } from '../source/source-effect-fill-gradient-opacity'
import type { OctopusArtboard } from './octopus-artboard'
import type { OctopusLayerBase } from './octopus-layer-base'
import type { ElementOf } from '@avocode/octopus-common/dist/utils/utility-types'

type FillGradientStop = ElementOf<Octopus['FillGradient']['gradient']['stops']>

type OctopusFillGradientOptions = {
  parentLayer: OctopusLayerBase
  fill: SourceEffectFill
  isStroke?: boolean
}

type GradientType = Octopus['FillGradient']['gradient']['type'] | 'REFLECTED'

type GradientSourceStop = SourceEffectFillGradientColor | SourceEffectFillGradientOpacity

type GradientClosestStops<T> = { left: T; right: T }

export class OctopusEffectFillGradient {
  private _parentLayer: OctopusLayerBase
  private _fill: SourceEffectFill
  private _isStroke: boolean

  static GRADIENT_TYPE_MAP = {
    linear: 'LINEAR',
    radial: 'RADIAL',
    Angl: 'ANGULAR',
    Dmnd: 'DIAMOND',
    reflected: 'REFLECTED',
  } as const

  constructor(options: OctopusFillGradientOptions) {
    this._parentLayer = options.parentLayer
    this._fill = options.fill
    this._isStroke = options.isStroke ?? false
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

  get type(): GradientType | null {
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

  private _getGradientStop(color: Octopus['Color'], location: number): FillGradientStop {
    const STOP_MAX_LOCATION = 4096
    const _location = this.isInverse ? STOP_MAX_LOCATION - location : location
    const position = _location / STOP_MAX_LOCATION
    const interpolation = 'LINEAR'
    const interpolationParameter = 1
    return { color, interpolation, interpolationParameter, position }
  }

  private _getClosestStops<T extends GradientSourceStop>(location: number, stops: T[]): GradientClosestStops<T> {
    const closest = { left: stops[0], right: stops[stops.length - 1] }
    const equal = stops.filter((stop) => stop.location === location)
    if (equal.length) {
      closest.left = equal[0]
      closest.right = equal[equal.length - 1]
    } else {
      const left = stops.filter((stop) => stop.location < location)
      const right = stops.filter((stop) => stop.location > location)
      if (left.length) closest.left = left[left.length - 1]
      if (right.length) closest.right = right[0]
    }
    return closest
  }

  private get _gradientStops(): Octopus['GradientColorStop'][] {
    const colorStops: SourceEffectFillGradientColor[] = this.fill.gradient?.colors ?? []
    const opacityStops: SourceEffectFillGradientOpacity[] = this.fill.gradient?.opacities ?? []

    const locations = uniq([
      ...colorStops.map((stop) => stop.location),
      ...opacityStops.map((stop) => stop.location),
    ]).sort((loc1, loc2) => loc1 - loc2)

    const stops = locations.map((location) => {
      const { left: lColor, right: rColor } = this._getClosestStops(location, colorStops)
      const { left: lOpacity, right: rOpacity } = this._getClosestStops(location, opacityStops)

      const colorRatio = lColor.location !== rColor.location ? invLerp(lColor.location, rColor.location, location) : 1
      const color = convertColor(lerpColor(lColor.color, rColor.color, colorRatio))

      const opacityRatio =
        lOpacity.location !== rOpacity.location ? invLerp(lOpacity.location, rOpacity.location, location) : 1
      const opacity = lerp(lOpacity.opacity, rOpacity.opacity, opacityRatio)
      const combinedOpacity = this._isStroke ? opacity : opacity * this._parentLayer.fillOpacity * this._fill.opacity

      const combinedColor = multiplyAlpha(color, combinedOpacity)
      return this._getGradientStop(combinedColor, location)
    })

    return this.isInverse ? stops.reverse() : stops
  }

  private _getGradient(type: GradientType): Octopus['FillGradient']['gradient'] {
    const stops = this._gradientStops ?? []
    if (type === 'REFLECTED') {
      const stopsLeft = [...stops].reverse().map((stop) => ({ ...stop, position: (1 - stop.position) / 2 }))
      const stopsRight = [...stops].map((stop) => ({ ...stop, position: (1 + stop.position) / 2 }))
      return { type: 'LINEAR', stops: [...stopsLeft, ...stopsRight] }
    }
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
    const offset = convertOffset(this.fill.offset, width, height)

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
    const offset = convertOffset(this.fill.offset, width, height)

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

  private get _positioning(): Octopus['FillPositioning'] {
    const type = this.type
    const isLinear = type === 'LINEAR' || type === 'REFLECTED'
    const transform = isLinear ? this._transformLinear : this._transformRadial
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
    const positioning = this._positioning

    return { type: 'GRADIENT', gradient, positioning }
  }
}
