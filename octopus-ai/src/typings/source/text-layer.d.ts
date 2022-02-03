import { RawGraphicsState } from "./graphics-state"

export type RawTextLayerText= {
    GraphicsState?: RawGraphicsState,
    TextMatrix?: number [],
    TextLineMatrix?: number [],
    Text?: (string|number)[] | string
}

export type RawTextLayer = {
    Type?: "TextGroup"
    Texts: RawTextLayerText[]
}

