import { RawGraphicsState } from "./graphics-state"

export type RawShapeLayerSubPathPoint = {
    Type?: string
    Coords: number[]

}

export type RawShapeLayerSubPath = {
    Type?: string
    Points?: RawShapeLayerSubPathPoint[]
    Closed?: boolean
    Coords?: number[]

}

export type RawShapeLayer = {
    Type?: "Path"
    GraphicsState?: RawGraphicsState<RawShapeLayer>
    Subpaths?: RawShapeLayerSubPath[]
    FillRule?: 'non-zero-winding-number' | 'even-odd',
    Fill?: boolean,
    Stroke?: boolean
}

