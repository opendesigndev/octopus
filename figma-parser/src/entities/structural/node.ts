import { flattenLayers, traverseAndFind } from '../../utils/common-design'
import firstCallMemo from '../../utils/decorators'

import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint'
import type { FigmaLayer, FigmaNode } from '../../types/figma'

type NodeOptions = {
  node: FigmaNode
  id: NodeAddress
}

export class Node {
  private _node: FigmaNode
  private _id: NodeAddress

  constructor(options: NodeOptions) {
    this._id = options.id
    this._node = options.node
  }

  get raw(): FigmaNode {
    return this._node
  }

  get document(): FigmaNode['document'] {
    return this._node?.document
  }

  get id(): string {
    return this.document?.id
  }

  get type(): string {
    return String(this.document?.type)
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

  @firstCallMemo()
  get allImageRefs(): string[] {
    const artboardRefs = traverseAndFind<string>(this.document, (obj: Record<string, unknown>) => {
      if ('imageRef' in obj) return obj.imageRef
    })
    // CommonUtils.matchAll(JSON.stringify(this.document), /"imageRef":"([^"]+)"/g)
    return [
      ...new Set(
        artboardRefs.reduce<string[]>((flat, ref) => {
          flat.push(ref) // ...refs.map((ref) => ref.replace(/.+\//g, ''))
          return flat
        }, [])
      ),
    ]
  }

  @firstCallMemo()
  get imageRefNodeIds(): string[] {
    return this.flatLayers.reduce<string[]>((ids, layer) => {
      ids.push(
        ...traverseAndFind<string>(layer, (obj: { id?: string; imageRef?: string }) => {
          return typeof obj?.imageRef === 'string' ? layer.id : undefined
        })
      )
      return ids
    }, [])
  }

  @firstCallMemo()
  get flatLayers(): FigmaLayer[] {
    return flattenLayers(this._node?.document)
  }

  // get isComponent() {
  //   return get(this.document, 'type') === 'COMPONENT'
  // }

  // get componentId() {
  //   return this.isComponent ? this.id : null
  // }

  getPixelsArea(): number {
    const { width, height } = Object(this.document?.absoluteBoundingBox) as { width: number; height: number }
    const area = width * height
    return Number.isNaN(area) ? 0 : area
  }
}
