export type FigmaNode = {
  document: {
    id: string
    name: string
    type: string
    children: FigmaLayer[]
    absoluteBoundingBox?: {
      width: number
      height: number
    }
  }
  schemaVersion: string
  styles: Record<
    string,
    {
      key: string
      name: string
      styleType: string
      description: string
    }
  >
  name: string
  components: Record<string, SourceComponent>
}

export type FigmaNodesResponse = {
  nodes: Record<string, FigmaNode>
}

export type FigmaPreviewsResponse = {
  err: unknown
  images: Record<string, string>
}

export type FigmaComponent = {
  error: boolean
  status: number
  meta: {
    key: string
    file_key: string
    node_id: string
    thumbnail_url: string
    name: string
    description: string
    created_at: string
    updated_at: string
    containing_frame: {
      pageId: string
      pageName: string
    }
    user: {
      id: string
      handle: string
      img_url: string
    }
  }
  i18n: null
}

export type ComponentDescriptor = {
  key: string
  name: string
  description: string
  localId: string
}

export type FigmaRenditionsResponse = {
  images: {
    image: string
    node_id: string
  }[]
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
  styles: Record<string, string>
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
    type: string
    children: FigmaPage[]
  }
  schemaVersion: string
  styles: Record<string, { key: string }>
  name: string
  components: Record<string, SourceComponent>
}

export type FigmaGroupLike = FigmaPage | FigmaArtboard | FigmaLayer

export type FigmaFillsDescriptor = {
  error: boolean
  status: number
  meta: {
    images: Record<string, string>
  }
  i18n: unknown
}

export type TargetIds = {
  topLevelArtboards: string[]
  localComponents: string[]
  remoteComponents: string[]
}
