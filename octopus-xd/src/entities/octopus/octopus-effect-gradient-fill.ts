import defaults from '../../utils/defaults'
import { parseXDColor } from '../../utils/color'
import { isObject } from '../../utils/common'
import { asArray, asNumber } from '../../utils/as'
import SourceEffectGradientFill from '../source/source-effect-gradient-fill'
import { convertObjectMatrixToArray } from '../../utils/matrix'
import { createMatrix, createPathEllipse, createPoint, createSize } from '../../utils/paper'

import type SourceResources from '../source/source-resources'
import type { Octopus } from '../../typings/octopus'
import type { RawGradientFill, RawGradientLinear, RawGradientRadial, RawGradientResources } from '../../typings/source'
import type { Defined } from '../../typings/helpers'
import OctopusBounds from './octopus-bounds'


type OctopusEffectGradientFillOptions = {
  source: SourceEffectGradientFill,
  resources: SourceResources,
  effectBounds: OctopusBounds
}

type OctopusEffectGradientFillFromRawOptions = {
  effect: RawGradientFill,
  resources: SourceResources,
  effectBounds: OctopusBounds
}

export default class OctopusEffectGradientFill {
  private _source: SourceEffectGradientFill
  private _resources: SourceResources
  private _effectBounds: OctopusBounds

  static VALID_GRADIENT_TYPES = [
    'linear',
    'radial'
  ]

  static GRADIENT_MAP = {
    'linear': 'LINEAR',
    'radial': 'RADIAL'
  } as const

  static fromRaw(options: OctopusEffectGradientFillFromRawOptions) {
    return new this({
      source: new SourceEffectGradientFill({
        effect: options.effect
      }),
      resources: options.resources,
      effectBounds: options.effectBounds
    })
  }

  constructor(options: OctopusEffectGradientFillOptions) {
    this._source = options.source
    this._resources = options.resources
    this._effectBounds = options.effectBounds
  }

  private _isValidGradientType(gradientType: unknown): gradientType is 'linear' {
    return OctopusEffectGradientFill.VALID_GRADIENT_TYPES.includes(gradientType as string)
  }

  private _getGradientResources() {
    const gradientId = this._source.ref

    const resourcesGradient = typeof gradientId === 'undefined'
      ? null
      : this._resources.raw?.resources?.gradients?.[gradientId]

    const localGradient = this._source.gradientResources
    return resourcesGradient || localGradient
  }

  private _getColors(gradient: RawGradientResources): Defined<Octopus['FillGradient']['gradient']['stops']> {
    return asArray(gradient?.stops).map((stop) => {
      const offset = asNumber(stop?.offset, 0)
      const color = stop?.color
      return {
        position: offset,
        color: parseXDColor(color)
      }
    })
  }

  private _getTransformLinear(): Octopus['Transform'] {
    const gradient = this._source.gradient as RawGradientLinear

    const w = asNumber(this._effectBounds.w, 0)
    const h = asNumber(this._effectBounds.h, 0)

    const x1 = asNumber(gradient?.x1, 0)
    const y1 = asNumber(gradient?.y1, 0)
    const x2 = asNumber(gradient?.x2, 0)
    const y2 = asNumber(gradient?.y2, 0)

    const p1 = { x: w * x1, y: h * y1 }
    const p2 = { x: w * x2, y: h * y2 }

    return [
      p2.x - p1.x,
      p2.y - p1.y,
      -(p2.y - p1.y), /** @TODO should be changed to 1 after rendering fix */
      p2.x - p1.x, /** @TODO should be changed to 1 after rendering fix */
      p1.x,
      p1.y
    ]
  }

  private _getTransformRadial(): Octopus['Transform'] {
    const gradient = this._source.gradient as RawGradientRadial

    const cx = asNumber(gradient.cx, 0)
    const cy = asNumber(gradient.cy, 0)
    const r = asNumber(gradient.r, 0)
    const w = asNumber(this._effectBounds.w, 0)
    const h = asNumber(this._effectBounds.h, 0)
    const transform = convertObjectMatrixToArray(gradient?.transform)
    const [ a, b, c, d, tx, ty ] =  transform || [ 1, 0, 0, 1, 0, 0 ]

    const centerPoint = createPoint(cx * w, cy * h)
    const oval = createPathEllipse(createPoint(0, 0), createSize(r, r))
    oval.transform(createMatrix(a, b, c, d, tx, ty))
    oval.scale(w * 2, h * 2)
    oval.position = centerPoint
    const [ , , s2, s3 ] = oval.segments.map(seg => seg.point)
    const [ p1, p2, p3 ] = [ centerPoint, s2, s3 ]
    
    return [
      p2.x - p1.x,
      p2.y - p1.y,
      p3.x - p1.x,
      p3.y - p1.y,
      p1.x, 
      p1.y
    ]
  }

  convert(): Octopus['FillGradient'] | null {
    const visible = this._source.type !== 'none'
    const gradient = this._getGradientResources()

    if (!isObject(gradient)) return null
    if (!this._isValidGradientType(gradient.type)) return null

    const type = OctopusEffectGradientFill.GRADIENT_MAP[gradient.type]
    const stops = this._getColors(gradient)

    const transform = type === 'LINEAR'
      ? this._getTransformLinear()
      : this._getTransformRadial()

    return {
      type: 'GRADIENT',
      visible,
      blendMode: defaults.BLEND_MODE,
      gradient: {
        type,
        stops
      },
      positioning: {
        layout: 'FILL',
        origin: 'LAYER',
        transform
      }
    }
  }
}