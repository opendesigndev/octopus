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

export type VectorOriginationData = Partial<{
  keyDescriptorList: VectorOriginationDatakeyDescriptor[]
}>

export type VectorOriginationDatakeyDescriptor = Partial<{
  keyOriginType: number
  keyOriginResolution: number
  keyOriginShapeBBox: RawBounds & { unitValueQuadVersion?: number }
  Trnf: RawMatrix
  keyOriginIndex: number
  keyOriginRRectRadii: RawRadiiCorners
}>
