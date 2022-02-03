import { RawGraphicsState } from "./graphics-state"

export type RawShapeLayerSubPathPoint = {
    Type?: string
    Coords: number[]

}

export type RawShapeLayerSubPath = {
    Type?: string
    Points?: RawShapeLayerSubPathPoint[]
    Closed?: boolean

}

export type RawShapeLayer = {
    Type?: "Path"
    GraphicsState?: RawGraphicsState<RawShapeLayer>
    Subpaths?: RawShapeLayerSubPath[]
    FillRule?: string,
    Fill?: boolean,
    Stroke?: boolean
}

