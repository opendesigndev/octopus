import type { Octopus } from '../../typings/octopus'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { SourceEffectStroke } from '../source/source-effect-stroke'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import { OctopusEffectFill } from './octopus-effect-fill'
import { logWarn } from '../../services/instances/misc'

type OctopusStrokeOptions = {
  parent: OctopusLayerShapeShapeAdapter
}

type Style = {
  style: Octopus['VectorStroke']['style']
  thickness: Octopus['VectorStroke']['thickness']
  dashing?: Octopus['VectorStroke']['dashing']
}

export class OctopusEffectStroke {
  protected _parent: OctopusLayerShapeShapeAdapter

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

  constructor(options: OctopusStrokeOptions) {
    this._parent = options.parent
  }

  private get _stroke(): SourceEffectStroke {
    return this._parent.sourceLayer.stroke
  }

  get position(): 'CENTER' | 'INSIDE' | 'OUTSIDE' | null {
    const lineAlignment = this._stroke.lineAlignment
    const result = getMapped(lineAlignment, OctopusEffectStroke.STROKE_POSITION_MAP, undefined)
    if (!result) {
      logWarn('Unknown Stroke position', { lineAlignment, stroke: this._stroke })
      return null
    }
    return result
  }

  get lineCap(): 'BUTT' | 'ROUND' | 'SQUARE' | null {
    const lineCap = this._stroke.lineCap
    const result = getMapped(lineCap, OctopusEffectStroke.STROKE_LINE_CAP_MAP, undefined)
    if (!result) {
      logWarn('Unknown Stroke line cap', { lineCap, stroke: this._stroke })
      return null
    }
    return result
  }

  get lineJoin(): 'ROUND' | 'MITER' | 'BEVEL' | null {
    const lineJoin = this._stroke.lineJoin
    const result = getMapped(lineJoin, OctopusEffectStroke.STROKE_LINE_JOIN_MAP, undefined)
    if (!result) {
      logWarn('Unknown Stroke line join', { lineJoin, stroke: this._stroke })
      return null
    }
    return result
  }

  get fill(): Octopus['Fill'] | null {
    const fill = this._stroke.fill
    return new OctopusEffectFill({ parent: this._parent, fill }).convert()
  }

  get style(): Style {
    const thickness = this._stroke.lineWidth
    const dashing = this._stroke.lineDashSet
    if (dashing === undefined) return { style: 'SOLID' as const, thickness }
    return {
      style: 'DASHED' as const,
      thickness,
      dashing: dashing.map((dash) => dash * thickness),
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
