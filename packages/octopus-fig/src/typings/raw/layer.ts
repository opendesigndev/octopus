import type { RawEffect } from './effect'
import type { RawPaint } from './paint'
import type {
  RawAlign,
  RawArcData,
  RawBlendMode,
  RawBooleanOperation,
  RawBoundingBox,
  RawConstraints,
  RawGeometry,
  RawVector,
  RawTransform,
} from './shared'
import type { RawTextStyle } from './text'

export type RawLayer = RawLayerFrame | RawLayerShape | RawLayerText

export type RawLayerType = RawLayer['type']

export type RawSlice = {
  id?: string
  name?: string
  visible?: boolean
  type?: 'SLICE'
  absoluteBoundingBox?: RawBoundingBox
  constraints?: RawConstraints
  relativeTransform?: RawTransform
  size?: RawVector
}

export type RawParent = {
  id?: string
  type?: RawLayerFrame['type'] | 'PAGE'
}

export type RawLayerBase = {
  id?: string
  name?: string
  locked?: boolean
  visible?: boolean
  blendMode?: RawBlendMode
  preserveRatio?: boolean
  absoluteBoundingBox?: RawBoundingBox
  absoluteRenderBounds?: RawBoundingBox
  constraints?: RawConstraints
  relativeTransform?: RawTransform
  opacity?: number
  size?: RawVector
  cornerRadius?: number
  rectangleCornerRadii?: number[]
  isMask?: boolean
  isMaskOutline?: boolean
  fills?: RawPaint[]
  strokes?: RawPaint[]
  strokeWeight?: number | null
  strokeAlign?: RawAlign
  effects?: RawEffect[]
  parent?: RawParent
}

export type RawStrokeCap = 'NONE' | 'ROUND' | 'SQUARE' | 'LINE_ARROW' | 'TRIANGLE_ARROW'
export type RawStrokeJoin = 'MITER' | 'BEVEL' | 'ROUND'

export type RawLayerVector = RawLayerBase & {
  fillGeometry?: RawGeometry[]
  strokeGeometry?: RawGeometry[]
  strokeCap?: RawStrokeCap
  strokeJoin?: RawStrokeJoin
  strokeDashes?: number[]
  strokeMiterAngle?: number
  arcData?: RawArcData
}

export type RawLayerFrame = RawLayerVector & {
  type?: 'FRAME' | 'GROUP' | 'COMPONENT' | 'COMPONENT_SET' | 'INSTANCE'
  clipsContent?: boolean
  children?: (RawLayer | RawSlice)[]
  componentId?: string
}

export type RawLayerShape = RawLayerVector & {
  type?: 'RECTANGLE' | 'LINE' | 'VECTOR' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'STAR' | 'BOOLEAN_OPERATION'
  booleanOperation?: RawBooleanOperation
  children?: RawLayerShape[]
}

export type RawLineTypes = 'NONE' | 'ORDERED' | 'UNORDERED'

export type RawLayerText = RawLayerVector & {
  type?: 'TEXT'
  characters?: string
  style?: RawTextStyle
  layoutVersion?: number
  characterStyleOverrides?: number[]
  styleOverrideTable?: { [key: string]: RawTextStyle | undefined }
  lineTypes?: RawLineTypes[]
  lineIndentations?: number[]
}
