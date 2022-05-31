import { Node } from '../structural/node'

import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint'
import type { FigmaNode } from '../../types/figma'
import type { Design } from './design'

type FrameLikeOptions = {
  design: Design
  node: FigmaNode
  id: NodeAddress
}

export class FrameLike {
  _design: Design
  _id: NodeAddress
  _node: Node

  constructor(options: FrameLikeOptions) {
    this._design = options.design
    this._node = new Node({ node: options.node, id: options.id })
  }

  ready(): Promise<void> {
    return Promise.resolve()
  }
}
