export type RawTextLayerTextGraphicsState = {
    CTM?: number[],
    ClippingPath?: object,
    ColorSpaceStroking?: string,
    ColorSpaceNonStroking?: string,
    ColorStroking?: number[],
    ColorNonStroking?: number[],
    TextCharSpace?: number,
    TextWordSpace?: number,
    TextScale?: number,
    TextLeading?: number,
    TextFont?: string,
    TextFontSize?: number,
    TextRender?: number,
    TextRise?: number,
    LineWidth?: number,
    LineCap?: number,
    LineJoin?: number,
    MiterLimit?: number,
    DashPattern?: (number|number[])[],
    RenderingIntent?: string,
    Flatness?: number,
    StrokeAdjustment?: false,
    BlendMode?: string,
    SoftMask?: null,
    AlphaConstant?: number,
    AlphaSource?: boolean,
    SpecifiedParameters?: string
}

export type RawTextLayerText= {
    GraphicsState?: RawTextLayerTextGraphicsState,
    TextMatrix?: number [] | null,
    TextLineMatrix?: number [] | null,
    Text?: (string|number)[] | null
}

export type RawTextLayer = {
    Type?: "TextGroup" | null
    Texts: RawTextLayerText[]
}

