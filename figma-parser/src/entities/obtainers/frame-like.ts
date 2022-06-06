import { Fills } from './fills'
import { Preview } from './preview'
import { Renditions } from './rendition'
import Styles from './styles'

import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint'
import type { Node } from '../structural/node'
import type { Design } from './design'

type FrameLikeOptions = {
  design: Design
  node: Node
  id: NodeAddress
}

export class FrameLike {
  _design: Design
  _id: NodeAddress
  _node: Node
  _fills: Fills
  _renditions: Renditions
  _preview: Preview | null
  _styles: Styles

  constructor(options: FrameLikeOptions) {
    this._design = options.design
    this._node = options.node
    this._fills = new Fills({ frameLike: this })
    this._renditions = new Renditions({ frameLike: this })
    this._preview = this._design.parser.config.framePreviews ? new Preview({ frameLike: this }) : null
    this._styles = new Styles({ frameLike: this })

    this._emitOnReady()
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

  private async _emitOnReady() {
    await this.ready()
    this._design.emit('ready:frame-like', {
      designId: this._node.designId,
      nodeId: this._node.nodeId,
      node: this._node.raw,
    })
  }

  fillsIds(): string[] {
    return this._node.allImageRefs
  }
}
