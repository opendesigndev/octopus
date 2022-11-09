import type { RawResourcesXObject } from './resources-x-object'

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

export type RawResourcesExtGStateSmask = Partial<{
  G: RawResources | RawResourcesXObject
  S: string
  TR: string
}>

export type RawResourcesExtGState = {
  [key: string]: Partial<{
    AIS: boolean
    BM: string
    CA: number
    OPM: number
    SA: boolean
    SMask: RawResourcesExtGStateSmask
    OP: boolean
    Type: string
    ca: number
    op: boolean
    ObjID: number
  }>
}

export type RawResourcesShadingKeyFunctionFunction = Partial<{
  C0: number[]
  C1: number[]
  Domain: number[]
  FunctionType: number
  N: number
  ObjID: number
}>

export type RawResourcesShadingKeyFunction = Partial<{
  Bounds: number[]
  Domain: number[]
  Encode: number[]
  FunctionType: number
  Functions: RawResourcesShadingKeyFunctionFunction[]
}>

export type RawResourcesShadingKey = Partial<{
  AntiAlias: false
  ColorSpace: [string] | string
  Coords: number[]
  Domain: number[]
  Extend: boolean[]
  Function: RawResourcesShadingKeyFunction
  ShadingType: number
  ObjID: number
}>

export type RawResourcesShading = {
  [shadingName: string]: RawResourcesShadingKey
}

export type RawResources = Partial<{
  ColorSpace: RawResourcesColorSpace
  ExtGState: RawResourcesExtGState
  Font: RawResourcesFont
  ProcSet: string[]
  Properties: RawResourcesProperties
  Shading: RawResourcesShading
  XObject: {
    [name: string]: RawResourcesXObject
  }
  BBox?: number[]
}>
