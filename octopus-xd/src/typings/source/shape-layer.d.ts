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

export type RawShapeRect = {
  type?: 'rect',
  x?: 0,
  y?: 0,
  width?: 627,
  height?: 488
}

export type RawShapeCompound = {
  type?: 'compound',
  path?: string,
  operation?: 'add', /** @TODO extend enum */
  children?: RawShapeLayer[] /** @TODO maybe not only shape layers */
}

export type RawShapeEllipse = {
  cx?: number,
  cy?: number,
  type?: 'ellipse',
  rx?: number,
  ry?: number
}

export type RawShapeCircle = {
  cx?: number,
  cy?: number,
  type?: 'circle',
  r?: number
}

export type RawShapeLine = {
  type?: 'line',
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number
}

export type RawShapePath = {
  type?: 'path',
  path?: string
}

export type RawShapePolygonPoint = {
  x: number,
  y: number
}

export type RawShapePolygon = {
  type?: 'polygon',
  points?: RawShapePolygonPoint[],
  'uxdesign#cornerCount'?: number,
  'uxdesign#width'?: number,
  'uxdesign#height'?: number
}

export type RawShape = 
  | RawShapeRect
  | RawShapeCompound
  | RawShapeEllipse
  | RawShapeCircle
  | RawShapeLine
  | RawShapePath
  | RawShapePolygon

export type RawShapeLayer = RawLayerCommon & {
  type?: 'shape',
  meta?: RawShapeLayerMeta,
  style?: RawStyle,
  shape?: RawShape
}