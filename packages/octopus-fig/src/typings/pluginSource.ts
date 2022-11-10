export type PluginSource = {
  type?: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE'
  version?: string
  timestamp?: string
  context?: PluginSourceContext
}

export type PluginSourceContext = {
  document?: PluginSourceDocument
  currentPage?: PluginSourceCurrentPage
  selectedContent?: unknown[] // TODO
}

export type PluginSourceDocument = {
  id?: string
  name?: string
}

export type PluginSourceCurrentPage = {
  id?: string
  name?: string
}
