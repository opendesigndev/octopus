import type { RawEffect } from './effect'
import type { RawFill } from './fill'
import type {
  RawAlign,
  RawArcData,
  RawBlendMode,
  RawBoundingBox,
  RawColor,
  RawConstraints,
  RawGeometry,
  RawSize,
  RawTODO,
  RawTransform,
} from './shared'
import type { RawTextStyle } from './text'

export type RawLayer =
  | RawLayerFrame
  | RawLayerSlice
  | RawLayerRectangle
  | RawLayerLine
  | RawLayerVector
  | RawLayerEllipse
  | RawLayerPolygon
  | RawLayerStar
  | RawLayerText

export type RawLayerSlice = {
  id?: string
  name?: string
  type?: 'SLICE'
  absoluteBoundingBox?: RawBoundingBox
  constraints?: RawConstraints
  relativeTransform?: RawTransform
  size?: RawSize
}

export type RawLayerBase = {
  id?: string
  name?: string
  blendMode?: RawBlendMode
  absoluteBoundingBox?: RawBoundingBox
  constraints?: RawConstraints
  relativeTransform?: RawTransform
  size?: RawSize
  fills?: RawFill[]
  strokes?: RawFill[]
  strokeWeight?: number | null
  strokeAlign?: RawAlign
  effects?: RawEffect[]
}

export type RawLayerFrame = RawLayerBase & {
  type?: 'FRAME'
  clipsContent?: boolean
  background?: RawFill[]
  backgroundColor?: RawColor
  children?: RawLayer[]
}

export type RawLayerRectangle = RawLayerBase & {
  type?: 'RECTANGLE'
  fillGeometry?: RawGeometry[]
  strokeGeometry?: RawGeometry[]
}

export type RawLayerLine = RawLayerBase & {
  type?: 'LINE'
  fillGeometry?: RawGeometry[]
  strokeGeometry?: RawGeometry[]
}

export type RawLayerVector = RawLayerBase & {
  type?: 'VECTOR'
  fillGeometry?: RawGeometry[]
  strokeGeometry?: RawGeometry[]
}

export type RawLayerEllipse = RawLayerBase & {
  type?: 'ELLIPSE'
  fillGeometry?: RawGeometry[]
  strokeGeometry?: RawGeometry[]
  arcData?: RawArcData
}

export type RawLayerPolygon = RawLayerBase & {
  type?: 'REGULAR_POLYGON'
  fillGeometry?: RawGeometry[]
  strokeGeometry?: RawGeometry[]
}

export type RawLayerStar = RawLayerBase & {
  type?: 'STAR'
  fillGeometry?: RawGeometry[]
  strokeGeometry?: RawGeometry[]
}

export type RawLayerText = RawLayerBase & {
  type?: 'TEXT'
  strokeGeometry?: RawGeometry[]
  characters?: string
  style?: RawTextStyle
  layoutVersion?: number
  characterStyleOverrides?: [] // TODO
  styleOverrideTable?: RawTODO
  lineTypes?: ['NONE'] // TODO
  lineIndentations?: [0] // TODO
}
