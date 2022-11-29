import type { StyledTextSegment } from '../figma-plugin-api'

export { StyledTextSegment }

export type PluginSource = {
  type?: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE'
  version?: string
  timestamp?: string
  context?: PluginSourceContext
}

export type ImageMap = { [key: string]: string | undefined }
export type StyledTextSegmentsMap = { [key: string]: StyledTextSegment[] | undefined }

export type SourceAssets = {
  images?: ImageMap
  styledTextSegments?: StyledTextSegmentsMap
}

export type PluginSourceContext = {
  document?: PluginSourceDocument
  currentPage?: PluginSourceCurrentPage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedContent?: any[] // TODO
  assets?: SourceAssets
}

export type PluginSourceDocument = {
  id?: string
  name?: string
}

export type PluginSourceCurrentPage = {
  id?: string
  name?: string
}
