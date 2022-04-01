import { RawLayer } from './layer'
import { RawResources } from './resources'

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

export type XObjectSubtype = 'Form' | 'Image'

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
  Subtype: XObjectSubtype
  Type: 'XObject'
  Width: number
  Kind: number
  Data: RawSourceXObjectData | RawLayer[]
  ObjID: number
  Resources: RawResources
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BBox: any //todo: check what this is when creating xobjectForm
}>
