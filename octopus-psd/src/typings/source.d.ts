import type { RawCombineOperation, RawGradientType } from './raw'

export type SourceCombineOperation = RawCombineOperation

export type SourceGradientType = RawGradientType

export type SourcePointXY = { x: number; y: number }

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
  blue: number
  green: number
  red: number
}

export type SourceMatrix = {
  tx: number
  ty: number
  xx: number
  xy: number
  yx: number
  yy: number
}
