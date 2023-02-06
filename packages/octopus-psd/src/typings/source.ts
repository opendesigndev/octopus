import type { RawSourceSubpath, RawVectorOriginationDatakeyDescriptor } from './raw'

export type SourcePointXY = { x: number; y: number }
export type SourceVectorXY = { x: number; y: number }

export type SourceBounds = {
  bottom: number
  left: number
  right: number
  top: number
  width: number
  height: number
}

export type SourceRadiiCorners = {
  bottomLeft: number
  bottomRight: number
  topLeft: number
  topRight: number
}

export type SourceColor = {
  b: number
  g: number
  r: number
}

export type SourceMatrix = {
  tx: number
  ty: number
  xx: number
  xy: number
  yx: number
  yy: number
}

export type SourceAlign = 'left' | 'right' | 'center' | 'justifyLeft' | 'justifyRight' | 'justifyCenter' | 'justifyAll'

export type SourceSourcePathComponent = Partial<{
  origin: RawVectorOriginationDatakeyDescriptor
  shapeOperation: number
  subpathListKey: RawSourceSubpath[]
}>

export type SourceDocumentDimensions = {
  width: number
  height: number
}
