import { RawLayer } from "./layer"


export type RawArtboardEntryContents = {
    Filter?:string,
    Length?: number,
    Kind?: number,
    Data?: RawLayer[]
}

export type RawArtboardEntryResourcesPropertiesUsageCreatorInfo = {
    Creator?:string
    Subtype?:string
}

export type RawArtboardEntryResourcesPropertiesUsage={
    CreatorInfo:RawArtboardEntryResourcesPropertiesUsageCreatorInfo
}&ObjectId

export type ObjectId= {ObjID?:number}

export type RawArtboardEntryResourcesProperties = {
    [id:string]:{
        Intent?:string[]
        Name?:string
        Type?:string
        Usage?: RawArtboardEntryResourcesPropertiesUsage
    }&ObjectId
}

export type RawArtboardMediaBox = [number,number,number,number]
type RawArtBoardEntryResourcesColorSpace = {
    CS0?: (number|object)[]
}

type RawArtBoardEntryResourcesExtGStateGS0 = {
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


type RawArtboardEntryResourcesFontTextFontFontDescriptorFontFile3={
    Filter?: string,
    Length?: number,
    Subtype?: string,
    Kind?: number,
}&ObjectId

type RawArtboardEntryResourcesFontTextFontFontDescriptor={
    Ascent?: number,
    CapHeight?: number,
    CharSet?: string,
    Descent?: number,
    Flags?: number,
    FontBBox?: number[],
    FontFamily?: string,
    FontFile3?:RawArtboardEntryResourcesFontTextFontFontDescriptorFontFile3
    FontName?: string,
    FontStretch?: string,
    FontWeight?: number,
    ItalicAngle?: number,
    StemV?: number,
    Type?: string,
    XHeight?: number,
}&ObjectId

export type RawArtboardEntryResourcesFontTextFont={
    BaseFont?: string
    Encoding?: string
    FirstChar?: number
    FontDescriptor?:RawArtboardEntryResourcesFontTextFontFontDescriptor
    LastChar?: number,
    Subtype?: string,
    Type?: string,
    Widths?: number[]
}&ObjectId

type RawArtboardEntryResourcesFontPropertiesMC0UsageCreatorInfo={
    Creator?: string
    Subtype?: string
}

type RawArtboardEntryResourcesFontPropertiesMC0Usage={
    CreatorInfo?:RawArtboardEntryResourcesFontPropertiesMC0UsageCreatorInfo
} & ObjectId

type RawArtboardEntryResourcesFontPropertiesMC0={
    Intent?: string[]
    Name?: string[]
    Type?: string
    Usage?:RawArtboardEntryResourcesFontPropertiesMC0Usage
} & ObjectId

type RawArtboardEntryResourcesFontProperties={
    MC0?:RawArtboardEntryResourcesFontPropertiesMC0
}

export type RawArtboardEntryResourcesFont = {
    Properties?:RawArtboardEntryResourcesFontProperties
}&{
    [TextFont:string]:RawArtboardEntryResourcesFontTextFont
}

type RawArtBoardEntryResourcesExtGState={
    GS0?: RawArtBoardEntryResourcesExtGStateGS0
}

export type RawArtBoardEntryResources = {
    ColorSpace?:RawArtBoardEntryResourcesColorSpace
    ExtGState?:RawArtBoardEntryResourcesExtGState
    Font?: RawArtboardEntryResourcesFont
    ProcSet?:string[]
    Properties?: RawArtboardEntryResourcesProperties
}

export type RawArtboardEntry = {
    Contents?:RawArtboardEntryContents,
    Id?: number
    Name?:string
    MediaBox?:RawArtboardMediaBox
    "OCProperties.D.OFF"?:ObjectId[]
    Resources?:RawArtBoardEntryResources
}