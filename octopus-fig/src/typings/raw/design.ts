import type { RawLayer, RawLayerFrame } from './layer'
import type { RawColor } from './shared'

type ComponentSet = {
  key?: string
  name?: string
  description?: string
}

type Component = {
  key?: string
  name?: string
  description?: string
  componentSetId?: string
}

type Style = {
  key?: string
  name?: string
  description?: string
  styleType?: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'
}

export type RawDesign = {
  document?: RawDocument
  components?: { [key: string]: Component }
  componentSets?: { [key: string]: ComponentSet }
  schemaVersion?: number
  styles?: { [key: string]: Style }
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
