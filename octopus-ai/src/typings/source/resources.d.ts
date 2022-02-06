export type ObjectId= {ObjID?:number}

type RawResourcesFontTextFontFontDescriptorFontFile3={
    Filter?: string,
    Length?: number,
    Subtype?: string,
    Kind?: number,
}&ObjectId

export type RawResourcesPropertiesUsageCreatorInfo = {
    Creator?:string
    Subtype?:string
}

export type RawResourcesPropertiesUsage={
    CreatorInfo:RawResourcesPropertiesUsageCreatorInfo
}&ObjectId


export type RawResourcesProperties = {
    [id:string]:{
        Intent?:string[]
        Name?:string
        Type?:string
        Usage?: RawResourcesPropertiesUsage
    }&ObjectId
}

export type RawResourcesFontTextFontFontDescriptor={
    Ascent?: number,
    CapHeight?: number,
    CharSet?: string,
    Descent?: number,
    Flags?: number,
    FontBBox?: number[],
    FontFamily?: string,
    FontFile3?:RawResourcesFontTextFontFontDescriptorFontFile3
    FontName?: string,
    FontStretch?: string,
    FontWeight?: number,
    ItalicAngle?: number,
    StemV?: number,
    Type?: string,
    XHeight?: number,
}&ObjectId

export type RawResourcesFontTextFont={
    BaseFont?: string
    Encoding?: string
    FirstChar?: number
    FontDescriptor?:RawResourcesFontTextFontFontDescriptor
    LastChar?: number,
    Subtype?: string,
    Type?: string,
    Widths?: number[]
}&ObjectId

type RawResourcesFontPropertiesMC0UsageCreatorInfo={
    Creator?: string
    Subtype?: string
}

type RawResourcesFontPropertiesMC0Usage={
    CreatorInfo?:RawResourcesFontPropertiesMC0UsageCreatorInfo
} & ObjectId

type RawResourcesFontPropertiesMC0={
    Intent?: string[]
    Name?: string[]
    Type?: string
    Usage?:RawResourcesFontPropertiesMC0Usage
} & ObjectId

type RawResourcesFontProperties={
    MC0?:RawResourcesFontPropertiesMC0
}

export type RawResourcesFont = {
    Properties?:RawResourcesFontProperties
}&{
    [TextFont:string]:RawResourcesFontTextFont
}

type RawResourcesColorSpace = {
    [key:string]: (number|object)[]
}

type RawResourcesExtGState={
    [key:string]:{
    AIS: boolean,
    BM: string,
    CA?: number,
    OPM?: number,
    SA?: boolean,
    SMask?: null,
    OP?: boolean,
    Type?: string,
    ca?: number,
    op?: false,
    ObjID?: 38
    }
}

export type RawResources = {
    ColorSpace?:RawResourcesColorSpace
    ExtGState?:RawResourcesExtGState
    Font?: RawResourcesFont
    ProcSet?:string[]
    Properties?: RawResourcesProperties
}