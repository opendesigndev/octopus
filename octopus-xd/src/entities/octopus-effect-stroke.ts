import defaults from '../utils/defaults'

import { getMapped } from '../utils/common'

import type { RawStroke } from '../typings/source'
import type { Octopus } from '../typings/octopus'
import { asNumber } from '../utils/as'
import OctopusEffectColorFill from './octopus-effect-color-fill'


type OctopusEffectStrokeOptions = {
  effect: RawStroke
}

export default class OctopusEffectStroke {
  _rawEffect: RawStroke

  static LINE_JOIN_MAP = {
    'bevel': 'BEVEL',
    'round': 'ROUND',
    'miter': 'MITER'
  } as const

  static LINE_CAP_MAP = {
    'round': 'ROUND',
    'butt': 'BUTT',
    'square': 'SQUARE'
  } as const

  static POSITION_MAP = {
    'center': 'CENTER',
    'inside': 'INSIDE',
    'outside': 'OUTSIDE'
  } as const

  constructor(options: OctopusEffectStrokeOptions) {
    this._rawEffect = options.effect
  }

  _parseDashing(rawDash: RawStroke['dash']): number[] | null {
    const dashSetExists = Array.isArray(rawDash) && rawDash.length
    if (!dashSetExists) return null
    return rawDash.length % 2 === 1
      ? [
        ...rawDash,
        ...rawDash.slice(-1)
      ]
      : rawDash.slice()
  }

  convert(): Octopus['EffectStroke'] | null {
    const visible = this._rawEffect?.type !== 'none'
    const dashing = this._parseDashing(this._rawEffect?.dash)
    const style = dashing ? 'DASHED' : 'SOLID'

    const { LINE_JOIN_MAP, LINE_CAP_MAP, POSITION_MAP } = OctopusEffectStroke
    const { STROKE_JOIN, STROKE_CAP, STROKE_POSITION } = defaults.EFFECTS

    const lineJoin = getMapped(this._rawEffect?.join, LINE_JOIN_MAP, STROKE_JOIN)
    const lineCap = getMapped(this._rawEffect?.cap, LINE_CAP_MAP, STROKE_CAP)
    const position = getMapped(this._rawEffect?.align, POSITION_MAP, STROKE_POSITION)

    const fill = new OctopusEffectColorFill({
      effect: {
        type: 'solid',
        color: this._rawEffect?.color
      }
    }).convert()

    if (!fill) return null

    return {
      type: 'STROKE' as const,
      visible,
      blendMode: defaults.BLEND_MODE,
      stroke: {
        thickness: asNumber(this._rawEffect?.width),
        position,
        fill,
        style,
        lineJoin,
        lineCap,
        ...(dashing ? { dashing } : null)
      }
    }
  }
}