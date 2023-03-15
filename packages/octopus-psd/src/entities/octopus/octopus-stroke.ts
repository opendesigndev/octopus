import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { getMapped } from '@opendesign/octopus-common/dist/utils/common.js'
import chunk from 'lodash/chunk.js'

import { OctopusEffectFill } from './octopus-effect-fill.js'
import { logger } from '../../services/index.js'

import type { OctopusLayerBase } from './octopus-layer-base.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceStroke } from '../source/source-stroke.js'

type OctopusStrokeOptions = {
  parentLayer: OctopusLayerBase
  stroke: SourceStroke
}

type Style = {
  style: Octopus['VectorStroke']['style']
  thickness: Octopus['VectorStroke']['thickness']
  dashing?: Octopus['VectorStroke']['dashing']
}

export class OctopusStroke {
  private _parentLayer: OctopusLayerBase
  private _stroke: SourceStroke

  static STROKE_POSITION_MAP = {
    strokeStyleAlignCenter: 'CENTER',
    strokeStyleAlignInside: 'INSIDE',
    strokeStyleAlignOutside: 'OUTSIDE',
  } as const

  static STROKE_LINE_CAP_MAP = {
    strokeStyleButtCap: 'BUTT',
    strokeStyleRoundCap: 'ROUND',
    strokeStyleSquareCap: 'SQUARE',
  } as const

  static STROKE_LINE_JOIN_MAP = {
    strokeStyleMiterJoin: 'MITER',
    strokeStyleRoundJoin: 'ROUND',
    strokeStyleBevelJoin: 'BEVEL',
  } as const

  static MIN_DASH_INPUT = 0.001

  constructor(options: OctopusStrokeOptions) {
    this._parentLayer = options.parentLayer
    this._stroke = options.stroke
  }

  get position(): 'CENTER' | 'INSIDE' | 'OUTSIDE' | null {
    const lineAlignment = this._stroke.lineAlignment
    const result = getMapped(lineAlignment, OctopusStroke.STROKE_POSITION_MAP, undefined)
    if (!result) {
      logger?.warn('Unknown Stroke position', { lineAlignment, stroke: this._stroke })
      return null
    }
    return result
  }

  get lineCap(): 'BUTT' | 'ROUND' | 'SQUARE' | null {
    const lineCap = this._stroke.lineCap
    const result = getMapped(lineCap, OctopusStroke.STROKE_LINE_CAP_MAP, undefined)
    if (!result) {
      logger?.warn('Unknown Stroke line cap', { lineCap, stroke: this._stroke })
      return null
    }
    return result
  }

  get lineJoin(): 'ROUND' | 'MITER' | 'BEVEL' | null {
    const lineJoin = this._stroke.lineJoin
    const result = getMapped(lineJoin, OctopusStroke.STROKE_LINE_JOIN_MAP, undefined)
    if (!result) {
      logger?.warn('Unknown Stroke line join', { lineJoin, stroke: this._stroke })
      return null
    }
    return result
  }

  @firstCallMemo()
  get fill(): Octopus['Fill'] | null {
    const parentLayer = this._parentLayer
    const fill = this._stroke.fill
    return new OctopusEffectFill({ parentLayer, fill, isStroke: true }).convert()
  }

  private _parseDashing(dashing: number[]): number[] {
    return chunk(dashing, 2)
      .map(([dash, offset]) => {
        return [Math.max(dash, OctopusStroke.MIN_DASH_INPUT), Math.max(offset ?? 0, OctopusStroke.MIN_DASH_INPUT)]
      })
      .flat()
  }

  get style(): Style {
    const thickness = this._stroke.lineWidth
    const dashing = this._stroke.lineDashSet
    if (dashing === undefined) return { style: 'SOLID' as const, thickness }
    return {
      style: 'DASHED' as const,
      thickness,
      dashing: this._parseDashing(dashing.map((dash) => dash * thickness)),
    }
  }

  convert(): Octopus['VectorStroke'] | null {
    if (!this._stroke.enabled) return null
    const fill = this.fill
    const position = this.position
    const lineJoin = this.lineJoin
    const lineCap = this.lineCap

    if (fill === null) return null
    if (position === null) return null
    if (lineCap === null) return null
    if (lineJoin === null) return null

    return { fill, position, lineJoin, lineCap, ...this.style }
  }
}
