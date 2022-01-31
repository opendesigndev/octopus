export type TextLayerText= {
    GraphicsState?: Object | null,
    TextMatrix?: number [] | null,
    TextLineMatrix?: number [] | null,
    Text?: (string|number)[] | null
}

export type TextLayer = {
    Type?: "TextGroup" | null
    Texts: TextLayerText[]
}