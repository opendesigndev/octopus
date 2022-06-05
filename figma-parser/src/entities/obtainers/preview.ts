import type { Parser } from '../../parser'
import type { ICacher } from '../../types/cacher'
import type { Design } from './design'
import type { FrameLike } from './frame-like'

type PreviewOptions = {
  frameLike: FrameLike
}

export class Preview {
  _frameLike: FrameLike
  _preview: Promise<ArrayBuffer>

  constructor(options: PreviewOptions) {
    this._frameLike = options.frameLike
    this._preview = this._initPreview()

    this._emitOnReady()
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

  private _getCachedPreview() {
    return this.cacher?.resolvePreview?.({
      designId: this.design.designId,
      nodeId: this._frameLike.node.nodeId,
    })
  }

  private async _requestPreview(): Promise<ArrayBuffer> {
    return this.parser.qm.queues.previews.exec(this._frameLike.node)
  }

  private async _initPreview(): Promise<ArrayBuffer> {
    // Cache
    const cached = await this._getCachedPreview()
    if (cached) return cached

    // Request & cache
    const preview = await this._requestPreview()
    this.cacher?.cachePreviews?.([[{ designId: this.design.designId, nodeId: this._frameLike.node.nodeId }, preview]])

    return preview
  }

  async ready(): Promise<void> {
    await this._preview
    return
  }

  private async _emitOnReady() {
    await this.ready()
    this.design.emit('ready:preview', {
      designId: this.design.designId,
      nodeId: this._frameLike.node.nodeId,
      buffer: await this._preview,
    })
  }
}
