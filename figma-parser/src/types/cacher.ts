import type { NodeAddress } from '../services/requests-manager/nodes-endpoint'
import type { FigmaFile, FigmaNode, FigmaFillsDescriptor } from './figma'

type CachedMeta<T> = {
  cached: T[]
  noncached: T[]
}
export interface ICacher {
  designs(designIds: string[]): Promise<CachedMeta<string>>
  nodes(ids: NodeAddress[]): Promise<CachedMeta<NodeAddress>>
  fills(fills: { designId: string; ref: string }[]): Promise<CachedMeta<{ designId: string; ref: string }>>
  renditions(renditions: NodeAddress[]): Promise<CachedMeta<NodeAddress>>

  resolveDesign(designId: string): Promise<FigmaFile>
  resolveNode(id: NodeAddress): Promise<FigmaNode>
  resolveFillsDescriptor(designId: string): Promise<FigmaFillsDescriptor>
  resolvePreview(id: NodeAddress): Promise<ArrayBuffer>
  resolveFill(designId: string, ref: string): Promise<ArrayBuffer>
  resolveRendition(id: NodeAddress): Promise<ArrayBuffer>

  cacheDesigns(designs: [string, FigmaFile][]): void
  cacheNodes(nodes: [NodeAddress, FigmaNode][]): void
  cacheFillsDescriptors(fillsDescriptors: [string, FigmaFillsDescriptor][]): void
  cachePreviews(previews: [NodeAddress, ArrayBuffer][]): void
  cacheFills(fills: [string, string, ArrayBuffer][]): void
  cacheRenditions(renditions: [NodeAddress, ArrayBuffer][]): void
}
