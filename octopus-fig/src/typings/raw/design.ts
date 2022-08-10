import type { RawLayer, RawLayerFrame } from './layer.js'
import type { RawColor } from './shared.js'

export type RawDesign = {
  document?: RawDocument
  components?: unknown // TODO
  componentSets?: unknown // TODO
  schemaVersion?: number
  styles?: unknown // TODO
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
  visible?: boolean
  children?: RawPage[]
}

type RawFlowStartingPoint = {
  nodeId?: string
  name?: string
}

export type RawPage = {
  id?: string
  name?: string
  type?: 'CANVAS'
  visible?: boolean
  children?: RawLayer[]
  backgroundColor?: RawColor
  flowStartingPoints?: RawFlowStartingPoint[]
}

export type RawArtboard = RawLayerFrame
