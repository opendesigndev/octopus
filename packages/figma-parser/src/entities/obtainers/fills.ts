import type { Parser } from '../../parser'
import type { ICacher } from '../../types/cacher'
import type { Design } from './design'
import type { FrameLike } from './frame-like'

type FillsOptions = {
  frameLike: FrameLike
}

export type ResolvedFill = {
  designId: string
  ref: string
  buffer: ArrayBuffer
}

export class Fills {
  _frameLike: FrameLike
  _fills: Promise<Record<string, Promise<ArrayBuffer>>>

  constructor(options: FillsOptions) {
    this._frameLike = options.frameLike
    this._fills = this._initFills()
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

  private _getCachedFills(fills: { designId: string; ref: string }[]): Promise<ArrayBuffer>[] {
    return fills.map(
      (fill) =>
        this.cacher?.resolveFill?.(fill.designId, fill.ref) ??
        Promise.reject(`Cache missing fill ${fill.designId}/${fill.ref}`)
    )
  }

  private async _requestFills(fills: { designId: string; ref: string }[]): Promise<Promise<ArrayBuffer>[]> {
    if (!fills.length) return []
    const s3Links = (await this.design.getLazyFillsDescriptor()).getImagesUrlsByIds(fills.map((fill) => fill.ref))
    const requestFills = this.parser.qm.queues.figmaS3.execMany(s3Links)
    requestFills.forEach((req, index) => {
      req.then((image) => {
        this.cacher?.cacheFills?.([[fills[index].designId, fills[index].ref, image]])
      })
    })
    return requestFills
  }

  private async _initFills() {
    const targetFills = this._frameLike.fillsIds()
    const fillIds = targetFills.map((fill) => {
      return { designId: this.design.designId, ref: fill }
    })
    const { cached, noncached } = (await this.cacher?.fills(fillIds)) ?? { cached: [], noncached: fillIds }
    const cachedFills = this._getCachedFills(cached)
    const requestedFills = await this._requestFills(noncached)
    const reorderedIds = [...cached, ...noncached]
    const fills = [...cachedFills, ...requestedFills].map((promise, index) => {
      return [
        reorderedIds[index].ref,
        promise.then((buffer) => {
          const fill: ResolvedFill = { designId: this.design.designId, ref: reorderedIds[index].ref, buffer }
          this.design.emit('ready:fill', fill)
          return buffer
        }),
      ]
    })

    return Object.fromEntries(fills) as Record<string, Promise<ArrayBuffer>>
  }

  async getFills(): Promise<Record<string, ArrayBuffer>> {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(await this._fills).map(async ([id, promise]) => {
          const buffer = await promise
          return [id, buffer]
        })
      )
    )
  }

  async ready(): Promise<void> {
    const fills = Object.values(await this._fills)
    await Promise.all(fills)
    return
  }
}
