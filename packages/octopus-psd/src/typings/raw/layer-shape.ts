import type { RawFill } from './effects'
import type { RawLayerCommon } from './layer'
import type { RawBlendMode, RawUnitPercent, RawUnitPoint } from './shared'

export type RawStrokeStyleLineAlignment =
  | 'strokeStyleAlignInside'
  | 'strokeStyleAlignCenter'
  | 'strokeStyleAlignOutside'

export type RawStrokeStyleLineCapType = 'strokeStyleButtCap' | 'strokeStyleRoundCap' | 'strokeStyleSquareCap'

export type RawStrokeStyleLineJoinType = 'strokeStyleMiterJoin' | 'strokeStyleRoundJoin' | 'strokeStyleBevelJoin'

export type RawShapeStrokeStyle = {
  fillEnabled?: boolean
  strokeEnabled?: boolean
  strokeStyleBlendMode?: RawBlendMode
  strokeStyleContent?: RawFill
  strokeStyleLineAlignment?: RawStrokeStyleLineAlignment
  strokeStyleLineCapType?: RawStrokeStyleLineCapType
  strokeStyleLineDashOffset?: RawUnitPoint
  strokeStyleLineDashSet?: number[]
  strokeStyleLineJoinType?: RawStrokeStyleLineJoinType
  strokeStyleLineWidth?: number | RawUnitPoint
  strokeStyleMiterLimit?: number
  strokeStyleOpacity?: RawUnitPercent
  strokeStyleResolution?: number
  strokeStyleScaleLock?: boolean
  strokeStyleStrokeAdjust?: boolean
  strokeStyleVersion?: number
}

export type RawLayerShape = RawLayerCommon & {
  type?: 'shapeLayer'
  alignEdges?: boolean
  fill?: RawFill
  strokeStyle?: RawShapeStrokeStyle
}
