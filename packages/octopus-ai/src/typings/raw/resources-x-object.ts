import type { RawLayer } from './layer.js'
import type { RawResources } from './resources.js'

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

export type XObjectSubtype = 'Form' | 'Image'

export type RawResourcesXObjectImage = { Image: string }

export type RawResourcesXObject = Partial<{
  Group: Partial<{
    I: boolean
    K: boolean
    S: string
    Type: string
    ObjID: number
  }>
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
  ObjID: number
  Resources: RawResources
  BBox: number[]
  Matrix: number[]
  Data: { Image: string } | RawLayer[]
}>
