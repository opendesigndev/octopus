import type { NodeAddress } from '../services/requests-manager/nodes-endpoint'
import type { FigmaFile, FigmaNode } from './figma'

export interface ICacher {
  resolveDesign(): Promise<FigmaFile>
  resolveNode(id: NodeAddress): Promise<FigmaNode>
  cacheDesign(designId: string, design: FigmaFile): void
  cacheNode(id: NodeAddress, node: FigmaNode): void
}
