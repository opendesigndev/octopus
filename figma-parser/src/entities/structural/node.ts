import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint'
import type { FigmaFile } from '../../types/figma'

type NodeOptions = {
  node: FigmaFile
  id: NodeAddress
}

export class Node {
  private _node: FigmaFile
  private _id: NodeAddress

  constructor(options: NodeOptions) {
    this._id = options.id
    this._node = options.node
  }

  get raw(): FigmaFile {
    return this._node
  }

  get document(): FigmaFile['document'] {
    return this._node?.document
  }

  get id(): string {
    return this.document?.id
  }

  get nodeId(): string {
    return this._id.nodeId
  }

  get designId(): string {
    return this._id.designId
  }

  get name(): string {
    return this.document?.name
  }
}
