import type { RawLayer } from './layer.js'
import type { RawColor } from './shared.js'

export type RawComponentSets = { [key: string]: RawComponentSet | undefined }
export type RawComponentSet = {
  key?: string
  name?: string
  description?: string
}

export type RawComponents = { [key: string]: RawComponent | undefined }
export type RawComponent = {
  key?: string
  name?: string
  description?: string
  componentSetId?: string
}

export type RawStyles = { [key: string]: RawStyle | undefined }
export type RawStyle = {
  key?: string
  name?: string
  description?: string
  styleType?: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'
}

export type RawDesign = {
  document?: RawDocument
  components?: RawComponents
  componentSets?: RawComponentSets
  schemaVersion?: number
  styles?: RawStyles
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
