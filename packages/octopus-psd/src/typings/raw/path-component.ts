import type { RawBounds, RawCombineOperation, RawMatrix, RawPointHV, RawPointXY } from './shared'

type RawBoxCorners = {
  rectangleCornerA?: RawPointHV
  rectangleCornerB?: RawPointHV
  rectangleCornerC?: RawPointHV
  rectangleCornerD?: RawPointHV
}

export type RawRadiiCorners = {
  bottomLeft?: number
  bottomRight?: number
  topLeft?: number
  topRight?: number
}

type RawOriginType = 'rect' | 'roundedRect' | 'line' | 'ellipse' | number

export type RawOrigin = {
  Trnf?: RawMatrix
  bounds?: RawBounds & { unitValueQuadVersion?: number }
  keyOriginBoxCorners?: RawBoxCorners
  keyOriginLineArrConc?: number
  keyOriginLineArrLngth?: number
  keyOriginLineArrWdth?: number
  keyOriginLineArrowEnd?: boolean
  keyOriginLineArrowSt?: boolean
  keyOriginLineEnd?: RawPointHV
  keyOriginLineStart?: RawPointHV
  keyOriginLineWeight?: number
  keyOriginResolution?: number
  keyOriginPolyPixelHSF?: number
  keyOriginPolyPreviousTightBoxCorners?: RawBoxCorners
  keyOriginPolySides?: number
  keyOriginPolyTrueRectCorners?: RawBoxCorners
  radii?: RawRadiiCorners
  type?: RawOriginType
}

export type RawSubpathPoint = {
  anchor?: RawPointXY
  backward?: RawPointXY
  forward?: RawPointXY
}

export type RawSubpath = {
  closedSubpath?: boolean
  points?: RawSubpathPoint[]
  subpathType?: 'NORMAL' | 'POLYGON_TOOL' | 'ZERO'
}

export type RawPathComponent = {
  origin?: RawOrigin
  shapeOperation?: RawCombineOperation
  subpathListKey?: RawSubpath[]
}
