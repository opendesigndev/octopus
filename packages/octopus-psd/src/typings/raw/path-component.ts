import type { RawBounds, RawMatrix, RawPointXY } from './shared'

export type RawRadiiCorners = {
  bottomLeft?: number
  bottomRight?: number
  topLeft?: number
  topRight?: number
}

export type RawSubpathPoint = {
  anchor?: RawPointXY
  backward?: RawPointXY
  forward?: RawPointXY
}

export type RawVectorOriginationData = Partial<{
  keyDescriptorList: RawVectorOriginationDatakeyDescriptor[]
}>

export type RawVectorOriginationDatakeyDescriptor = Partial<{
  keyOriginType: 1 | 2 | 4 | 5
  keyOriginResolution: number
  keyOriginShapeBBox: RawBounds & { unitValueQuadVersion?: number }
  Trnf: RawMatrix
  keyOriginIndex: number
  keyOriginRRectRadii: RawRadiiCorners
}>

export type RawSourceSubpath = {
  points: RawSubpathPoint[]
  closedSubpath: number | undefined
}
