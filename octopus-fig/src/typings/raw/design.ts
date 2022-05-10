import type { RawLayer, RawLayerFrame } from './layer'
import type { RawTODO, RawColor } from './shared'

export type RawDesign = {
  document?: RawDocument
  components?: RawTODO
  componentSets?: RawTODO
  schemaVersion?: number
  styles?: RawTODO
  name?: string
  lastModified?: string
  thumbnailUrl?: string
  version?: string
  role?: string
  editorType?: string
  linkAccess?: string
}

export type RawDocument = {
  id?: string
  name?: string
  type?: 'DOCUMENT'
  children?: RawPage[]
}

export type RawPage = {
  id?: string
  name?: string
  type?: 'CANVAS'
  children?: RawLayer[]
  backgroundColor?: RawColor
  prototypeStartNodeID?: null
  flowStartingPoints?: RawTODO[]
  prototypeDevice?: {
    type: 'NONE'
    rotation: 'NONE'
  }
}

export type RawArtboard = RawLayerFrame
