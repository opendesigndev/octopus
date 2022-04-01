import { RawLayer } from './layer'
import { RawResources, RawObjectId } from './resources'

export type RawArtboardEntryContents = {
  Filter?: string
  Length?: number
  Kind?: number
  Data?: RawLayer[]
}

export type RawArtboardEntryResourcesPropertiesUsageCreatorInfo = {
  Creator?: string
  Subtype?: string
}

export type RawArtboardEntryResourcesPropertiesUsage = {
  CreatorInfo?: RawArtboardEntryResourcesPropertiesUsageCreatorInfo
} & RawObjectId

export type RawArtboardEntryResourcesProperties = {
  [id: string]: {
    Intent?: string[]
    Name?: string
    Type?: string
    Usage?: RawArtboardEntryResourcesPropertiesUsage
  } & RawObjectId
}

export type RawArtboardMediaBox = [number, number, number, number]

export type OCPropertiesD = {
  OFF?: RawObjectId[]
}
export type OCProperties = {
  D?: OCPropertiesD
}
export type RawArtboardEntry = {
  Contents?: RawArtboardEntryContents
  Id?: number
  Name?: string
  MediaBox?: RawArtboardMediaBox
  OCProperties?: OCProperties
  Resources?: RawResources
}
