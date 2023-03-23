import type { RawFill } from './effects.js'
import type { AddedType, RawParsedLayerLayer } from './layer.js'
import type { RawUnitPoint } from './shared.js'

export type RawStrokeStyleLineAlignment =
  | 'strokeStyleAlignInside'
  | 'strokeStyleAlignCenter'
  | 'strokeStyleAlignOutside'

export type RawStrokeStyleLineCapType = 'strokeStyleButtCap' | 'strokeStyleRoundCap' | 'strokeStyleSquareCap'

export type RawStrokeStyleLineJoinType = 'strokeStyleMiterJoin' | 'strokeStyleRoundJoin' | 'strokeStyleBevelJoin'

export type RawShapeStrokeStyle = Partial<{
  fillEnabled: boolean
  strokeEnabled: boolean
  strokeStyleBlendMode: string
  strokeStyleContent: RawFill
  strokeStyleLineAlignment: RawStrokeStyleLineAlignment
  strokeStyleLineCapType: RawStrokeStyleLineCapType
  strokeStyleLineDashOffset: RawUnitPoint
  strokeStyleLineDashSet: number[]
  strokeStyleLineJoinType: RawStrokeStyleLineJoinType
  strokeStyleLineWidth: number
  strokeStyleMiterLimit: number
  strokeStyleOpacity: number
  strokeStyleResolution: number
  strokeStyleScaleLock: boolean
  strokeStyleStrokeAdjust: boolean
  strokeStyleVersion: number
}>

export type RawLayerShape = RawParsedLayerLayer & AddedType<'shapeLayer'>

export type RawVectorMaskSetting = Partial<{
  signature: string
  key: 'vmsk' | 'vsms'
  version: number
  pathRecords: (RawPathRecord | RawBezierKnot)[]
  invert: boolean
  notLink: boolean
  disable: boolean
}>

export type RawBezierKnot = Partial<{
  type: 1 | 2 | 4 | 5
  preceding: RawPointCoordinate
  anchor: RawPointCoordinate
  leaving: RawPointCoordinate
}>

export type RawPathRecord = Partial<{
  type: 0 | 3
  length: number
  operation: number
  subpathType: number
  index: number
}>

export type RawPathData = RawBezierKnot | RawPathRecord

export type RawPointCoordinate = Partial<{ vert: number; horiz: number }>
