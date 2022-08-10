import type { Parser } from '../../parser.js'
import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint.js'
import type { ICacher } from '../../types/cacher.js'
import type { Design } from './design.js'
import type { FrameLike } from './frame-like.js'

type RenditionsOptions = {
  frameLike: FrameLike
}

export class Renditions {
  _frameLike: FrameLike
  _renditions: Promise<Record<string, Promise<ArrayBuffer>>>

  constructor(options: RenditionsOptions) {
    this._frameLike = options.frameLike
    this._renditions = this.parser.config.shouldRenderImagerefs ? this._initRenditions() : Promise.resolve({})
  }

  get parser(): Parser {
    return this._frameLike._design.parser
  }

  get design(): Design {
    return this._frameLike._design
  }

  get cacher(): ICacher | null {
    return this.parser.services.cacher
  }

  private _getCachedRenditions(ids: NodeAddress[]): Promise<ArrayBuffer>[] {
    return ids.map((id) => this.cacher?.resolveRendition?.(id) ?? Promise.reject(`Cache missing rendition ${id}`))
  }

  private async _requestRenditions(ids: NodeAddress[]): Promise<Promise<ArrayBuffer>[]> {
    const tasks = ids.map((id) => id.nodeId)
    return this.parser.qm.queues.renditions.execMany(tasks)
  }

  private async _initRenditions(): Promise<Record<string, Promise<ArrayBuffer>>> {
    const ids = this._frameLike.node.imageRefNodeIds.map((id) => {
      return {
        nodeId: id,
        designId: this.design.designId,
      }
    })

    const { cached, noncached } = (await this.cacher?.renditions(ids)) ?? { cached: [], noncached: ids }
    const cachedFills = this._getCachedRenditions(cached)
    const requestedFills = await this._requestRenditions(noncached)
    const reorderedIds = [...cached, ...noncached]
    const renditions = [...cachedFills, ...requestedFills].map((promise, index) => {
      return [
        reorderedIds[index].nodeId,
        promise.then((buffer) => {
          this.design.emit('ready:rendition', {
            designId: this.design.designId,
            nodeId: reorderedIds[index].nodeId,
            buffer,
          })
          return buffer
        }),
      ]
    })

    return Object.fromEntries(renditions) as Record<string, Promise<ArrayBuffer>>
  }

  async getRenditions(): Promise<Record<string, ArrayBuffer>> {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(await this._renditions).map(async ([id, promise]) => {
          const buffer = await promise
          return [id, buffer]
        })
      )
    )
  }

  async ready(): Promise<void> {
    const renditions = Object.values(await this._renditions)
    await Promise.all(renditions)
    return
  }
}
