import { RawGraphicsState } from './graphics-state'

export type RawShapeLayerSubPathPoint = {
  Type?: string
  Coords: number[]
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

export type RawShapeLayerFillRule = 'non-zero-winding-number' | 'even-odd'
export type RawShapeLayer = {
  Type?: 'Path'
  GraphicsState?: RawGraphicsState
  Subpaths?: RawShapeLayerSubPath[]
  FillRule?: RawShapeLayerFillRule
  Fill?: boolean
  Stroke?: boolean
}
