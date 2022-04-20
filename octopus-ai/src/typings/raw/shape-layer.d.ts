import type { RawGraphicsState } from './graphics-state'

export type RawShapeLayerSubPathPoint = {
  Type?: string
  Coords?: number[]
}

type X = number
type Y = number
type Width = number
type Height = number

export type RawShapeLayerSubPath = {
  Type?: string
  Points?: RawShapeLayerSubPathPoint[]
  Closed?: boolean
  Coords?: [X, Y, Width, Height]
}

export type RawShapeLayerFillRule = 'nonzero-winding-number' | 'even-odd'
export type RawShapeLayer = {
  Name?: string
  Type?: 'Path'
  GraphicsState?: RawGraphicsState
  Subpaths?: RawShapeLayerSubPath[]
  FillRule?: RawShapeLayerFillRule
  Fill?: boolean
  Stroke?: boolean
}
