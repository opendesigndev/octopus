import { EventEmitter } from 'eventemitter3'

import { logger } from '../../services'
import { File } from '../structural/file'
import { Node } from '../structural/node'
import { FrameLike } from './frame-like'

import type { Parser } from '../../parser'
import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint'
import type { ICacher } from '../../types/cacher'
import type { FigmaFile, FigmaNode } from '../../types/figma'

type DesignOptions = {
  designId: string
  parser: Parser
}

type DesignMeta = {
  schemaVersion: string
  name: string
}

export class Design extends EventEmitter {
  private _parser: Parser
  private _designId: string
  private _file: Promise<File>
  private _frameLikes: Promise<FrameLike[]>

  constructor(options: DesignOptions) {
    super()
    this._designId = options.designId
    this._parser = options.parser
    this._file = this._initFile()
    this._frameLikes = this._initFrameLikes()

    this._emitOnReady()
  }

  private get _cacher(): ICacher | null {
    return this._parser.services.cacher
  }

  private _createTargetDesignIds(ids: string[]): NodeAddress[] {
    return ids.map((id) => ({ nodeId: id, designId: this._designId }))
  }

  private _getCachedFrameLikes(ids: NodeAddress[]): Promise<FigmaNode>[] {
    return ids.map(
      (id) => this._cacher?.resolveNode?.(id) ?? Promise.reject(`Cache missing frame-like ${id.designId}/${id.nodeId}`)
    )
  }

  private async _cacheRequestedFrameLike(id: NodeAddress, request: Promise<FigmaNode>): Promise<FigmaNode> {
    request.then((node) => {
      this._cacher?.cacheNodes?.([[id, node]])
    })
    return request
  }

  private async _initFrameLikes(): Promise<FrameLike[]> {
    const targetIds = this._createTargetDesignIds(await this._getTargetIds())

    const { cached, noncached } = (await this._cacher?.nodes?.(targetIds)) ?? { cached: [], noncached: targetIds }
    const reorderedIds = [...cached, ...noncached]

    const cachedFrameLikes = this._getCachedFrameLikes(cached)
    const requestedFrameLikes = this._parser.qm.queues.partialSync.execMany(noncached).map((request, index) => {
      return this._cacheRequestedFrameLike(noncached[index], request)
    })
    const frameLikes = await Promise.all(
      [...cachedFrameLikes, ...requestedFrameLikes].map(async (request, index) => {
        const node = new Node({ node: await request, id: reorderedIds[index] })
        return new FrameLike({
          node,
          id: reorderedIds[index],
          design: this,
        })
        // const node = await request
        // const nodes = unwrap([new Node({ node, id: reorderedIds[index] })])
        // return nodes.map((node) => {
        //   return new FrameLike({
        //     node,
        //     id: reorderedIds[index],
        //     design: this,
        //   })
        // })
      })
    )

    return frameLikes // .flat(1)
  }

  private async _getTargetIds() {
    const file = await this._file
    const { topLevelArtboards, localComponents } = file.getScopedTargetIds(this._parser.config.targetIds)
    const { targetIds, shouldFetchUsedComponents } = this._parser.config
    const skipComponentsIfScoped = targetIds.length && !shouldFetchUsedComponents
    const localComponentsIds = skipComponentsIfScoped ? [] : localComponents
    if (this.parser.config.isVerbose) {
      logger?.info('Target top level artboards', topLevelArtboards)
      logger?.info('Target local components', localComponentsIds)
    }
    return [...topLevelArtboards, ...localComponentsIds]
  }

  private async _getCachedDesign(): Promise<FigmaFile | undefined> {
    return this._cacher?.resolveDesign?.(this._designId)
  }

  private async _requestDesign(): Promise<FigmaFile> {
    const url = this._parser.rm.file.prepareRequest(this._designId)
    return (await this.parser.downloader.getJSON(url)) as FigmaFile
  }

  private async _initFile(): Promise<File> {
    // Cache
    const cached = await this._getCachedDesign()
    if (cached) return new File({ file: cached })

    // Request & cache
    const design = await this._requestDesign()
    this._cacher?.cacheDesigns?.([[this._designId, design]])

    return new File({ file: design })
  }

  private async _readyFrameLikes() {
    return Promise.all((await this._frameLikes).map((frameLike) => frameLike.ready()))
  }

  async frameLikes(): Promise<FrameLike[]> {
    await this._readyFrameLikes()
    return this._frameLikes
  }

  get parser(): Parser {
    return this._parser
  }

  async ready(): Promise<void> {
    await this._readyFrameLikes()
    return
  }

  private async _emitOnReady() {
    await this.ready()
    this.emit('ready:design', {
      designId: this._designId,
      design: (await this._file).raw,
    })
  }

  get designId(): string {
    return this._designId
  }

  async meta(): Promise<DesignMeta> {
    const design = await this._file
    return {
      schemaVersion: design.schemaVersion,
      name: design.name,
    }
  }
}
