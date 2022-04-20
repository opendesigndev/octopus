import type { RawShapeLayer } from '.'

export type RawGraphicsStateMatrix = [number, number, number, number, number, number]
export type DashPattern = [number[], number]

export type RawGraphicsState = {
  CTM?: RawGraphicsStateMatrix
  ClippingPath?: RawShapeLayer[] | null
  ColorSpaceStroking?: string
  ColorSpaceNonStroking?: string
  ColorStroking?: number[]
  ColorNonStroking?: number[]
  TextCharSpace?: number
  TextWordSpace?: number
  TextScale?: number
  TextLeading?: number
  TextFont?: string
  TextFontSize?: number
  TextRender?: number
  TextRise?: number
  LineWidth?: number
  LineCap?: number
  LineJoin?: number
  MiterLimit?: number
  DashPattern?: DashPattern
  RenderingIntent?: string
  Flatness?: number
  StrokeAdjustment?: false
  BlendMode?: string
  SoftMask?: null
  AlphaConstant?: number
  AlphaSource?: boolean
  SpecifiedParameters?: string
}
