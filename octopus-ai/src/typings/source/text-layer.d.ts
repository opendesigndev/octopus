export type RawTextLayerText= {
    GraphicsState?: Object | null,
    TextMatrix?: number [] | null,
    TextLineMatrix?: number [] | null,
    Text?: (string|number)[] | null
}

export type RawTextLayer = {
    Type?: "TextGroup" | null
    Texts: RawTextLayerText[]
}