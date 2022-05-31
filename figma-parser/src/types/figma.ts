export type FigmaNode = FigmaFile

export type FigmaNodesResponse = {
  nodes: Record<string, FigmaNode>
}

export type FigmaArtboard = {
  id: string
  name: string
  type: string
  children: FigmaLayer[]
}

export type FigmaPage = {
  id: string
  name: string
  type: 'CANVAS'
  children: FigmaArtboard[]
}

export type FigmaLayer = {
  id: string
  type: string
  name: string
  children: FigmaLayer[]
}

export type SourceComponent = {
  key: string
  name: string
  description: string
}

export type FigmaFile = {
  document: {
    id: string
    name: string
    children: FigmaPage[]
  }
  schemaVersion: string
  styles: Record<string, unknown>
  name: string
  components: Record<string, SourceComponent>
}

export type FigmaGroupLike = FigmaPage | FigmaArtboard | FigmaLayer

export type TargetIds = {
  topLevelArtboards: string[]
  localComponents: string[]
  remoteComponents: string[]
}
