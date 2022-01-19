import type { RawBounds, RawCombineOperation, RawMatrix, RawPointHV, RawPointXY } from './shared'

type RawBoxCorners = {
  rectangleCornerA?: RawPointHV
  rectangleCornerB?: RawPointHV
  rectangleCornerC?: RawPointHV
  rectangleCornerD?: RawPointHV
}

type RawOrigin = {
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
  type?: 'rect' | 'roundedRect' | 'line' | 'ellipse' | number
}

type RawSubpathPoint = {
  anchor?: RawPointXY
  backward?: RawPointXY
  forward?: RawPointXY
}

type RawSubpath = {
  closedSubpath?: boolean
  points?: RawSubpathPoint[]
  subpathType?: 'NORMAL' | 'POLYGON_TOOL' | 'ZERO'
}

export type RawPathComponent = {
  origin?: RawOrigin
  shapeOperation?: RawCombineOperation
  subpathListKey?: RawSubpath[]
}
