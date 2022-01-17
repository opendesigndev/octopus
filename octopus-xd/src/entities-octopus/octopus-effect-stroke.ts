import defaults from '../utils/defaults'
import { getMapped } from '../utils/common'
import { asNumber } from '../utils/as'
import OctopusEffectColorFill from './octopus-effect-color-fill'
import SourceEffectStroke from '../entities-source/source-effect-stroke'

import type { RawStroke } from '../typings/source'
import type { Octopus } from '../typings/octopus'
import type { SourceEffectStrokeOptions } from '../entities-source/source-effect-stroke'


type OctopusEffectStrokeOptions = {
  source: SourceEffectStroke
}

export default class OctopusEffectStroke {
  private _source: SourceEffectStroke

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

  static fromRaw(options: SourceEffectStrokeOptions) {
    return new this({
      source: new SourceEffectStroke(options)
    })
  }

  constructor(options: OctopusEffectStrokeOptions) {
    this._source = options.source
  }

  private _parseDashing(rawDash: RawStroke['dash']): number[] | null {
    const dashSetExists = Array.isArray(rawDash) && rawDash.length
    if (!dashSetExists) return null
    return rawDash.length % 2 === 1
      ? [
        ...rawDash,
        ...rawDash.slice(-1)
      ]
      : rawDash.slice()
  }

  convert(): Octopus['VectorStroke'] | null {
    const visible = this._source.type !== 'none'
    const dashing = this._parseDashing(this._source.dash)
    const style = dashing ? 'DASHED' : 'SOLID'

    const { LINE_JOIN_MAP, LINE_CAP_MAP, POSITION_MAP } = OctopusEffectStroke
    const { STROKE_JOIN, STROKE_CAP, STROKE_POSITION } = defaults.EFFECTS

    const lineJoin = getMapped(this._source.join, LINE_JOIN_MAP, STROKE_JOIN)
    const lineCap = getMapped(this._source.cap, LINE_CAP_MAP, STROKE_CAP)
    const position = getMapped(this._source.align, POSITION_MAP, STROKE_POSITION)

    const fill = OctopusEffectColorFill.fromRaw({
      effect: {
        type: 'solid',
        color: this._source.color
      }
    }).convert()

    if (!fill) return null

    return {
      thickness: asNumber(this._source.width),
      position,
      fill,
      visible,
      style,
      lineJoin,
      lineCap,
      ...(dashing ? { dashing } : null)
    }
  }
}