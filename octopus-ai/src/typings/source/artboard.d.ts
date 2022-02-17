import { RawLayer } from './layer'
import { RawResources, ObjectId } from './resources'

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
  CreatorInfo: RawArtboardEntryResourcesPropertiesUsageCreatorInfo
} & ObjectId

export type RawArtboardEntryResourcesProperties = {
  [id: string]: {
    Intent?: string[]
    Name?: string
    Type?: string
    Usage?: RawArtboardEntryResourcesPropertiesUsage
  } & ObjectId
}

export type RawArtboardMediaBox = [number, number, number, number]

export type RawArtboardEntry = {
  Contents?: RawArtboardEntryContents
  Id?: number
  Name?: string
  MediaBox?: RawArtboardMediaBox
  'OCProperties.D.OFF'?: ObjectId[]
  Resources?: RawResources
}
