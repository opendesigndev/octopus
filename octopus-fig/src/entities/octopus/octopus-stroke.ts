import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'

import { logWarn } from '../../services/instances/misc'
import { OctopusEffectFill } from './octopus-effect-fill'

import type { Octopus } from '../../typings/octopus'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourcePaint } from '../source/source-paint'

type OctopusStrokeOptions = {
  sourceLayer: SourceLayerShape
  fill: SourcePaint
}

type Style = {
  style: Octopus['VectorStroke']['style']
  thickness: Octopus['VectorStroke']['thickness']
  dashing?: Octopus['VectorStroke']['dashing']
}

export class OctopusStroke {
  protected _sourceLayer: SourceLayerShape
  private _fill: SourcePaint

  static STROKE_ALIGNS = ['CENTER', 'INSIDE', 'OUTSIDE']

  static STROKE_JOINS = ['MITER', 'BEVEL', 'ROUND']

  static STROKE_CAP_MAP = {
    NONE: 'BUTT',
    ROUND: 'ROUND',
    SQUARE: 'SQUARE',
  } as const

  constructor(options: OctopusStrokeOptions) {
    this._sourceLayer = options.sourceLayer
    this._fill = options.fill
  }

  get position(): 'CENTER' | 'INSIDE' | 'OUTSIDE' | null {
    const strokeAlign = this._sourceLayer.strokeAlign
    if (!OctopusStroke.STROKE_ALIGNS.some((align) => align === strokeAlign)) {
      logWarn('Unknown Stroke Align', { strokeAlign })
      return null
    }
    return strokeAlign
  }

  get lineCap(): 'BUTT' | 'ROUND' | 'SQUARE' | null {
    const strokeCap = this._sourceLayer.strokeCap
    const result = getMapped(strokeCap, OctopusStroke.STROKE_CAP_MAP, undefined)
    if (!result) {
      logWarn('Unknown Stroke Cap', { strokeCap })
      return null
    }
    return result
  }

  get lineJoin(): 'ROUND' | 'MITER' | 'BEVEL' | null {
    const strokeJoin = this._sourceLayer.strokeJoin
    if (!OctopusStroke.STROKE_JOINS.some((join) => join === strokeJoin)) {
      logWarn('Unknown Stroke join', { strokeJoin })
      return null
    }
    return strokeJoin
  }

  @firstCallMemo()
  get fill(): Octopus['Fill'] | null {
    return new OctopusEffectFill({ fill: this._fill }).convert()
  }

  get style(): Style {
    const thickness = this._sourceLayer.strokeWeight
    const dashing = this._sourceLayer.strokeDashes
    if (dashing.length === 0) return { style: 'SOLID' as const, thickness }
    return {
      style: 'DASHED' as const,
      thickness,
      dashing: dashing.map((dash) => dash * thickness), // TODO
    }
  }

  convert(): Octopus['VectorStroke'] | null {
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
