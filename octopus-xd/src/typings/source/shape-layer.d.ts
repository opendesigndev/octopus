import type { RawColor, RawLayerCommon } from '.'

export type RawShapeLayerMeta = {
  ux?: {
    nameL10N?: 'SHAPE_RECTANGLE',
  }
}

export type RawFill = {
  type?: 'solid',
  color?: RawColor
}

export type RawStyle = {
  fill?: RawFill,
  stroke?: {
    type?: 'solid',
    color?: RawColor,
    width?: 1,
    align?: 'inside'
  }
}

export type RawShape = {
  type?: 'rect',
  x?: 0,
  y?: 0,
  width?: 627,
  height?: 488
}

export type RawShapeLayer = RawLayerCommon & {
  type?: 'shape',
  meta?: RawShapeLayerMeta,
  style?: RawStyle,
  shape?: RawShape
}