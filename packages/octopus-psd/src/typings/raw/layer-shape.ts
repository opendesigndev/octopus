import type { RawFill } from './effects'
import type { AddedType, ParsedLayerLayer } from './layer'
import type { RawUnitPoint } from './shared'

export type RawStrokeStyleLineAlignment =
  | 'strokeStyleAlignInside'
  | 'strokeStyleAlignCenter'
  | 'strokeStyleAlignOutside'

export type RawStrokeStyleLineCapType = 'strokeStyleButtCap' | 'strokeStyleRoundCap' | 'strokeStyleSquareCap'

export type RawStrokeStyleLineJoinType = 'strokeStyleMiterJoin' | 'strokeStyleRoundJoin' | 'strokeStyleBevelJoin'

export type RawShapeStrokeStyle = {
  fillEnabled?: boolean
  strokeEnabled?: boolean
  strokeStyleBlendMode?: string
  strokeStyleContent?: RawFill
  strokeStyleLineAlignment?: RawStrokeStyleLineAlignment
  strokeStyleLineCapType?: RawStrokeStyleLineCapType
  strokeStyleLineDashOffset?: RawUnitPoint
  strokeStyleLineDashSet?: number[]
  strokeStyleLineJoinType?: RawStrokeStyleLineJoinType
  strokeStyleLineWidth?: number
  strokeStyleMiterLimit?: number
  strokeStyleOpacity?: number
  strokeStyleResolution?: number
  strokeStyleScaleLock?: boolean
  strokeStyleStrokeAdjust?: boolean
  strokeStyleVersion?: number
}

export type RawLayerShape = ParsedLayerLayer & AddedType<'shapeLayer'>

export type VectorMaskSetting = {
  signature: string
  key: 'vmsk' | 'vsms'
  version: number
  pathRecords: (PathRecord | BezierKnot)[]
  invert: boolean
  notLink: boolean
  disable: boolean
}

export type BezierKnot = Partial<{
  type: 1 | 2 | 4 | 5
  preceding: PointCoordinate
  anchor: PointCoordinate
  leaving: PointCoordinate
}>

export type PathRecord = Partial<{
  type: 0 | 3
  length: number
  operation: number
  subpathType: number
  index: number
}>

export type PathData = BezierKnot | PathRecord

export type PointCoordinate = Partial<{ vert: number; horiz: number }>
