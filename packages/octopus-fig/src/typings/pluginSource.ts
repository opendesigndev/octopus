export type PluginSource = {
  type?: 'OPEN_DESIGN_FIGMA_PLUGIN_SOURCE'
  version?: string
  timestamp?: string
  context?: PluginSourceContext
}

export type PluginSourceContext = {
  document?: PluginSourceDocument
  currentPage?: PluginSourceCurrentPage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedContent?: any[] // TODO
}

export type PluginSourceDocument = {
  id?: string
  name?: string
}

export type PluginSourceCurrentPage = {
  id?: string
  name?: string
}
