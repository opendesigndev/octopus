import { Fills } from './fills'
import { Preview } from './preview'
import { Renditions } from './renditions'
import Styles from './styles'

import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint'
import type { FigmaNode } from '../../types/figma'
import type { Node } from '../structural/node'
import type { Design } from './design'
import type { Style } from './styles'

type FrameLikeOptions = {
  design: Design
  node: Node
  id: NodeAddress
  role: 'artboard' | 'component' | 'library'
}

export type ResolvedFrame = {
  designId: string
  nodeId: string
  node: FigmaNode
  fills: Record<string, ArrayBuffer>
  preview: ArrayBuffer | null
  renditions: Record<string, ArrayBuffer>
  styles: Style[]
}

export class FrameLike {
  _design: Design
  _id: NodeAddress
  _node: Node
  _fills: Fills
  _renditions: Renditions
  _preview: Preview | null
  _styles: Styles
  _role: 'artboard' | 'component' | 'library'

  constructor(options: FrameLikeOptions) {
    this._design = options.design
    this._node = options.node
    this._fills = new Fills({ frameLike: this })
    this._renditions = new Renditions({ frameLike: this })
    this._preview = this._design.parser.config.framePreviews ? new Preview({ frameLike: this }) : null
    this._styles = new Styles({ frameLike: this })
    this._role = options.role

    this._emitOnReady()
  }

  get role(): 'artboard' | 'component' | 'library' {
    return this._role
  }

  get node(): Node {
    return this._node
  }

  get name(): string {
    return this._node.name
  }

  async ready(): Promise<void> {
    await this._fills.ready()
    await this._renditions.ready()
    if (this._preview) {
      await this._preview.ready()
    }
    return
  }

  async getResolvedDescriptor(): Promise<ResolvedFrame> {
    await this.ready()
    return {
      designId: this._node.designId,
      nodeId: this._node.nodeId,
      node: this._node.raw,
      fills: await this._fills.getFills(),
      preview: (await this._preview?.getPreview()) ?? null,
      renditions: await this._renditions.getRenditions(),
      styles: this._styles.getStyles(),
    }
  }

  private async _emitOnReady() {
    this._design.emit(`ready:${this._role}`, await this.getResolvedDescriptor())
  }

  fillsIds(): string[] {
    return this._node.allImageRefs
  }
}
