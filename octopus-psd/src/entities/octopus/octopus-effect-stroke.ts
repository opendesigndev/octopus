import type { Octopus } from '../../typings/octopus'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { SourceEffectStroke } from '../source/source-effect-stroke'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import { OctopusEffectFill } from './octopus-effect-fill'

type OctopusStrokeOptions = {
  parent: OctopusLayerShapeShapeAdapter
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

  get sourceLayer(): SourceLayerShape {
    return this._parent.sourceLayer
  }

  get stroke(): SourceEffectStroke {
    return this.sourceLayer.stroke
  }

  get position() {
    const lineAlignment = this.stroke.lineAlignment
    const result = getMapped(lineAlignment, OctopusEffectStroke.STROKE_POSITION_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Stroke position', { lineAlignment, stroke: this.stroke })
      return null
    }
    return result
  }

  get lineCap() {
    const lineCap = this.stroke.lineCap
    const result = getMapped(lineCap, OctopusEffectStroke.STROKE_LINE_CAP_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Stroke line cap', { lineCap, stroke: this.stroke })
      return null
    }
    return result
  }

  get lineJoin() {
    const lineJoin = this.stroke.lineJoin
    const result = getMapped(lineJoin, OctopusEffectStroke.STROKE_LINE_JOIN_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Stroke line join', { lineJoin, stroke: this.stroke })
      return null
    }
    return result
  }

  get fill(): Octopus['Fill'] | null {
    const fill = this.sourceLayer.stroke.fill
    return new OctopusEffectFill({ parent: this._parent, fill }).convert()
  }

  get style() {
    const thickness = this.stroke.lineWidth
    const dashing = this.stroke.lineDashSet
    if (dashing === undefined) return { style: 'SOLID' as const, thickness }
    return {
      style: 'DASHED' as const,
      thickness,
      dashing: dashing.map((dash) => dash * thickness),
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
