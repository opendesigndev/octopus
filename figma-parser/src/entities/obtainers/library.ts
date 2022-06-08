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
  _component: Promise<Node | null>
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

  private async _requestComponent(): Promise<(NodeAddress & { component: FigmaNode }) | null> {
    return this._design.parser.qm.queues.libraries.exec(this._componentMeta.key)
  }

  private async _getCachedComponent(): Promise<(NodeAddress & { component: FigmaNode }) | undefined> {
    return this.cacher?.resolveComponent?.(this._componentMeta.key)
  }

  private async _initComponent(): Promise<Node | null> {
    const cachedComponent = await this._getCachedComponent()
    if (cachedComponent) {
      return new Node({
        id: { designId: cachedComponent.designId, nodeId: cachedComponent.nodeId },
        node: cachedComponent.component,
      })
    }

    const component = await this._requestComponent()
    if (!component) {
      return null
    }

    this.cacher?.cacheComponents?.([[this._componentMeta.key, component]])

    return new Node({
      id: {
        designId: component.designId,
        nodeId: component.nodeId,
      },
      node: component.component,
    })
  }

  private async _initFrameLike() {
    const component = await this._component
    if (!component) return null
    return new FrameLike({
      design: this._design,
      node: component,
      id: {
        designId: component.designId,
        nodeId: component.nodeId,
      },
      role: 'library',
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
