import { Node } from '../structural/node'
import { FrameLike } from './frame-like'

import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint'
import type { ICacher } from '../../types/cacher'
import type { ComponentDescriptor, FigmaNode } from '../../types/figma'
import type { Design } from './design'
import type { ResolvedFrame } from './frame-like'

type LibraryOptions = {
  design: Design
  componentMeta: ComponentDescriptor
}

export class Library {
  _design: Design
  _componentMeta: ComponentDescriptor
  _component: Promise<{
    node: Node
    meta: {
      name: string
      description: string
      designId: string
      designNodeId: string
    }
  } | null>
  _frameLike: Promise<FrameLike | null>

  constructor(options: LibraryOptions) {
    this._design = options.design
    this._componentMeta = options.componentMeta
    this._component = this._initComponent()
    this._frameLike = this._initFrameLike()

    // this._emitOnReady()
  }

  get cacher(): ICacher | null {
    return this._design.cacher
  }

  private async _requestComponent(): Promise<
    (NodeAddress & { name: string; description: string } & { component: FigmaNode }) | null
  > {
    return this._design.parser.qm.queues.libraries.exec(this._componentMeta.key)
  }

  private async _getCachedComponent(): Promise<
    (NodeAddress & { name: string; description: string } & { component: FigmaNode }) | undefined
  > {
    return this.cacher?.resolveComponent?.(this._componentMeta.key)
  }

  private async _initComponent(): Promise<{
    node: Node
    meta: { name: string; description: string; designId: string; designNodeId: string }
  } | null> {
    const cachedComponent = await this._getCachedComponent()
    if (cachedComponent) {
      return {
        node: new Node({
          id: { designId: cachedComponent.designId, nodeId: cachedComponent.nodeId },
          node: cachedComponent.component,
        }),
        meta: {
          name: cachedComponent.name,
          description: cachedComponent.description,
          designId: cachedComponent.designId,
          designNodeId: cachedComponent.nodeId,
        },
      }
    }

    const component = await this._requestComponent()
    if (!component) {
      return null
    }

    this.cacher?.cacheComponents?.([[this._componentMeta.key, component]])

    return {
      node: new Node({
        id: {
          designId: component.designId,
          nodeId: component.nodeId,
        },
        node: component.component,
      }),
      meta: {
        name: component.name,
        description: component.description,
        designId: component.designId,
        designNodeId: component.nodeId,
      },
    }
  }

  private async _initFrameLike() {
    const component = await this._component
    if (!component) return null
    return new FrameLike({
      design: this._design,
      node: component.node,
      id: {
        designId: component.node.designId,
        nodeId: component.node.nodeId,
      },
      role: 'library',
      libraryMeta: component.meta,
    })
  }

  async getResolvedDescriptor(): Promise<ResolvedFrame | null> {
    const frameLike = await this._frameLike
    if (!frameLike) return null
    return frameLike.getResolvedDescriptor()
  }

  // private async _emitOnReady() {
  //   const resolved = await this.getResolvedDescriptor()
  //   if (resolved) {
  //     this._design.emit('ready:library', resolved)
  //   }
  // }

  async ready(): Promise<void> {
    await this._component
    const frameLike = await this._frameLike
    if (frameLike) {
      await frameLike.ready()
    }
    return
  }
}
