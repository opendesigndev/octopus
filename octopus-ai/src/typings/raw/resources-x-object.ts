export type RawSourceXObjectColorSpaceObject = Partial<{
  Filter: string
  Length: number
  N: number
  Kind: number
  ObjID: number
}>

export type RawSourceXObjectDecodeParms = Partial<{
  BitsPerComponent: number
  Colors: number
  Columns: number
}>

export type RawSourceXObjectData = {
  [key: string]: string
}

export type RawResourcesXObject = Partial<{
  BitsPerComponent: number
  ColorSpace: [string, RawSourceXObjectColorSpaceObject]
  DecodeParms: RawSourceXObjectDecodeParms
  Filter: string
  Height: number
  Intent: string
  Length: number
  Name: string
  SMask: RawResourcesXObject
  Subtype: string
  Type: 'XObject'
  Width: number
  Kind: number
  Data: RawSourceXObjectData
  ObjID: number
}>
