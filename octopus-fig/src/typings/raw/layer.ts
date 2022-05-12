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

export type RawLayer = RawLayerFrame | RawLayerShape | RawLayerText

export type RawSlice = {
  id?: string
  name?: string
  visible?: boolean
  type?: 'SLICE'
  absoluteBoundingBox?: RawBoundingBox
  constraints?: RawConstraints
  relativeTransform?: RawTransform
  size?: RawSize
}

export type RawLayerBase = {
  id?: string
  name?: string
  visible?: boolean
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
  children?: (RawLayer | RawSlice)[]
}

export type RawLayerShape = RawLayerBase & {
  type?: 'RECTANGLE' | 'LINE' | 'VECTOR' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'STAR'
  fillGeometry?: RawGeometry[]
  strokeGeometry?: RawGeometry[]
  arcData?: RawArcData
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
