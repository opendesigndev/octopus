import { FillsDescriptor } from '../structural/fills-descriptor'

import type { Parser } from '../../parser'
import type { ICacher } from '../../types/cacher'
import type { FigmaFillsDescriptor } from '../../types/figma'
import type { Design } from './design'
import type { FrameLike } from './frame-like'

type FillsOptions = {
  frameLike: FrameLike
}

export class Fills {
  _frameLike: FrameLike
  _fillsDescriptor: Promise<FillsDescriptor>
  _fills: Promise<Record<string, Promise<ArrayBuffer>>>

  constructor(options: FillsOptions) {
    this._frameLike = options.frameLike
    this._fillsDescriptor = this._initFillsDescriptor()
    this._fills = this._initFills()

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

  private _getCachedFillsDescriptor(): Promise<FigmaFillsDescriptor> | undefined {
    return this.cacher?.resolveFillsDescriptor?.(this.design.designId)
  }

  private async _requestFillsDescriptor(): Promise<FigmaFillsDescriptor> {
    const fillsDescriptor = await this.parser.qm.queues.fills.exec(this.design.designId)
    return fillsDescriptor as FigmaFillsDescriptor
  }

  private async _initFillsDescriptor() {
    // Cache
    const cached = await this._getCachedFillsDescriptor()
    if (cached) return new FillsDescriptor({ fillsDescriptor: cached })

    // Request & cache
    const fillsDescriptor = await this._requestFillsDescriptor()
    const { designId } = this.design
    this.cacher?.cacheFillsDescriptors?.([[designId, fillsDescriptor]])

    return new FillsDescriptor({ fillsDescriptor })
  }

  private _getCachedFills(fills: { designId: string; ref: string }[]): Promise<ArrayBuffer>[] {
    return fills.map(
      (fill) =>
        this.cacher?.resolveFill?.(fill.designId, fill.ref) ??
        Promise.reject(`Cache missing fill ${fill.designId}/${fill.ref}`)
    )
  }

  private async _requestFills(fills: { designId: string; ref: string }[]): Promise<Promise<ArrayBuffer>[]> {
    const s3Links = (await this._fillsDescriptor).getImagesUrlsByIds(fills.map((fill) => fill.ref))
    return this.parser.qm.queues.figmaS3.execMany(s3Links)
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
          this.design.emit('ready:fill', { designId: this.design.designId, ref: reorderedIds[index].ref, buffer })
          return buffer
        }),
      ]
    })

    return Object.fromEntries(fills) as Record<string, Promise<ArrayBuffer>>
  }

  async ready(): Promise<void> {
    const fills = Object.values(await this._fills)
    await Promise.all(fills)
    return
  }

  private async _emitOnReady(): Promise<void> {
    await this.ready()
    const allFills = this._frameLike.fillsIds()
    const allS3Links = (await this._fillsDescriptor).getImagesUrlsByIds(allFills)
    this.design.emit('ready:fills', {
      designId: this.design.designId,
      nodeId: this._frameLike.node.nodeId,
      fills: Object.fromEntries(allFills.map((fill, index) => [fill, allS3Links[index]])),
    })
  }
}
