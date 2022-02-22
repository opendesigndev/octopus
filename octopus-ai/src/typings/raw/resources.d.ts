export type RawObjectId = { ObjID?: number }

type RawResourcesFontTextFontFontDescriptorFontFile3 = {
  Filter?: string
  Length?: number
  Subtype?: string
  Kind?: number
} & RawObjectId

export type RawResourcesPropertiesUsageCreatorInfo = {
  Creator?: string
  Subtype?: string
}

export type RawResourcesPropertiesUsage = {
  CreatorInfo?: RawResourcesPropertiesUsageCreatorInfo
} & RawObjectId

export type RawResourcesProperties = {
  [id: string]: Partial<{
    Intent: string[]
    Name: string
    Type: string
    Usage: RawResourcesPropertiesUsage
  }> &
    RawObjectId
}

export type RawResourcesFontTextFontFontDescriptor = {
  Ascent?: number
  CapHeight?: number
  CharSet?: string
  Descent?: number
  Flags?: number
  FontBBox?: number[]
  FontFamily?: string
  FontFile3?: RawResourcesFontTextFontFontDescriptorFontFile3
  FontName?: string
  FontStretch?: string
  FontWeight?: number
  ItalicAngle?: number
  StemV?: number
  Type?: string
  XHeight?: number
} & RawObjectId

export type RawResourcesFontTextFont = {
  BaseFont?: string
  Encoding?: string
  FirstChar?: number
  FontDescriptor?: RawResourcesFontTextFontFontDescriptor
  LastChar?: number
  Subtype?: string
  Type?: string
  Widths?: number[]
} & RawObjectId

type RawResourcesFontPropertiesMC0UsageCreatorInfo = {
  Creator?: string
  Subtype?: string
}

type RawResourcesFontPropertiesMC0Usage = {
  CreatorInfo?: RawResourcesFontPropertiesMC0UsageCreatorInfo
} & RawObjectId

type RawResourcesFontPropertiesMC0 = {
  Intent?: string[]
  Name?: string[]
  Type?: string
  Usage?: RawResourcesFontPropertiesMC0Usage
} & RawObjectId

type RawResourcesFontProperties = {
  MC0?: RawResourcesFontPropertiesMC0
}

export type RawResourcesFont = {
  Properties?: RawResourcesFontProperties
} & {
  [TextFont: string]: RawResourcesFontTextFont
}

export type RawResourcesColorSpace = {
  [key: string]: Record<string, unknown>
}

export type RawResourcesExtGState = {
  [key: string]: Partial<{
    AIS: boolean
    BM: string
    CA: number
    OPM: number
    SA: boolean
    //@todo will change this type when layer is created with non null value
    SMask: null
    OP: boolean
    Type: string
    ca: number
    op: boolean
    ObjID: 38
  }>
}

export type RawResources = {
  ColorSpace?: RawResourcesColorSpace
  ExtGState?: RawResourcesExtGState
  Font?: RawResourcesFont
  ProcSet?: string[]
  Properties?: RawResourcesProperties
}
