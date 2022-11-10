import type { FigmaFile, FigmaNode } from './figma'

export type NodeAddress = {
  nodeId: string
  designId: string
}

type CachedMeta<T> = {
  cached: T[]
  noncached: T[]
}
export interface ICacher {
  finalize(): Promise<unknown>

  designs(designIds: string[]): Promise<CachedMeta<string>>
  nodes(ids: NodeAddress[]): Promise<CachedMeta<NodeAddress>>
  fills(fills: { designId: string; ref: string }[]): Promise<CachedMeta<{ designId: string; ref: string }>>
  // renditions(renditions: NodeAddress[]): Promise<CachedMeta<NodeAddress>>

  resolveDesign(designId: string): Promise<FigmaFile>
  resolveNode(id: NodeAddress): Promise<FigmaNode>
  resolvePreview(id: NodeAddress): Promise<ArrayBuffer>
  resolveFill(designId: string, ref: string): Promise<ArrayBuffer>
  // resolveRendition(id: NodeAddress): Promise<ArrayBuffer>
  resolveComponent(
    componentId: string
  ): Promise<NodeAddress & { name: string; description: string } & { component: FigmaNode }>

  cacheDesigns(designs: [string, FigmaFile][]): void
  cacheNodes(nodes: [NodeAddress, FigmaNode][]): void
  cachePreviews(previews: [NodeAddress, ArrayBuffer][]): void
  cacheFills(fills: [string, string, ArrayBuffer][]): void
  // cacheRenditions(renditions: [NodeAddress, ArrayBuffer][]): void
  cacheComponents(components: [string, NodeAddress & { component: FigmaNode }][]): void
}
