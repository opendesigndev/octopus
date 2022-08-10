import { EventEmitter } from 'eventemitter3'

import { logger } from '../../services/index.js'
import { File } from '../structural/file.js'
import { FillsDescriptor } from '../structural/fills-descriptor.js'
import { Node } from '../structural/node.js'
import { FrameLike } from './frame-like.js'
import { Library } from './library.js'

import type { Parser } from '../../parser.js'
import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint.js'
import type { ICacher } from '../../types/cacher.js'
import type { FigmaFile, FigmaFillsDescriptor, FigmaNode } from '../../types/figma.js'
import type { ResolvedFrame } from './frame-like.js'

type DesignOptions = {
  designId: string
  parser: Parser
}

type DesignMeta = {
  schemaVersion: string
  name: string
}

export type ResolvedDesign = {
  designId: string
  design: FigmaFile
  content: Promise<{
    artboards: ResolvedFrame[]
    components: ResolvedFrame[]
    libraries: ResolvedFrame[]
  }>
}

export class Design extends EventEmitter {
  private _parser: Parser
  private _designId: string
  private _file: Promise<File>
  private _frameLikes: Promise<FrameLike[]>
  private _fillsDescriptor: Promise<FillsDescriptor>
  private _libraries: Promise<Library[]>

  constructor(options: DesignOptions) {
    super()
    this._designId = options.designId
    this._parser = options.parser
    this._file = this._initFile()
    this._frameLikes = this._initFrameLikes()
    this._libraries = this._initLibraries()

    this._emitOnReady()
  }

  get raw(): Promise<File> {
    return this._file
  }

  get cacher(): ICacher | null {
    return this._parser.services.cacher
  }

  get parser(): Parser {
    return this._parser
  }

  get designId(): string {
    return this._designId
  }

  private _createTargetDesignIds(ids: string[]): NodeAddress[] {
    return ids.map((id) => ({ nodeId: id, designId: this._designId }))
  }

  private _getCachedFrameLikes(ids: NodeAddress[]): Promise<FigmaNode>[] {
    return ids.map(
      (id) => this.cacher?.resolveNode?.(id) ?? Promise.reject(`Cache missing frame-like ${id.designId}/${id.nodeId}`)
    )
  }

  private async _cacheRequestedFrameLike(id: NodeAddress, request: Promise<FigmaNode>): Promise<FigmaNode> {
    request.then((node) => {
      this.cacher?.cacheNodes?.([[id, node]])
    })
    return request
  }

  private async _initFrameLikes(): Promise<FrameLike[]> {
    const targetIds = this._createTargetDesignIds(await this._getTargetIds())

    const { cached, noncached } = (await this.cacher?.nodes?.(targetIds)) ?? { cached: [], noncached: targetIds }
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
          role: node.type === 'COMPONENT' ? 'component' : 'artboard',
        })
      })
    )

    return frameLikes
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
    return this.cacher?.resolveDesign?.(this._designId)
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
    this.cacher?.cacheDesigns?.([[this._designId, design]])

    return new File({ file: design })
  }

  private async _readyFrameLikes() {
    return Promise.all((await this._frameLikes).map((frameLike) => frameLike.ready()))
  }

  private async _readyLibraries() {
    return Promise.all((await this._libraries).map((library) => library.ready()))
  }

  async getResolvedDescriptor(): Promise<ResolvedDesign> {
    const artboards = this._frameLikes.then((frameLikes) => {
      return Promise.all(
        frameLikes
          .filter((frameLike) => frameLike.role === 'artboard')
          .map((frameLike) => {
            return frameLike.getResolvedDescriptor()
          })
      )
    })

    const components = this._frameLikes.then((frameLikes) => {
      return Promise.all(
        frameLikes
          .filter((frameLike) => frameLike.role === 'component')
          .map((frameLike) => {
            return frameLike.getResolvedDescriptor()
          })
      )
    })

    const libraries = this._libraries.then((libraries) => {
      return Promise.all(libraries.map((library) => library.getResolvedDescriptor())).then((libraries) => {
        return libraries.filter((library) => library) as ResolvedFrame[]
      })
    })

    return {
      designId: this._designId,
      design: (await this._file).raw,
      content: Promise.all([artboards, components, libraries]).then(async (result) => {
        const [artboards, components, libraries] = result
        return { artboards, components, libraries }
      }),
    }
  }

  private async _emitOnReady() {
    this.emit('ready:design', await this.getResolvedDescriptor())
  }

  private async _initLibraries() {
    const { targetIds, shouldFetchUsedComponents, shouldObtainLibraries } = this.parser.config
    if (!shouldObtainLibraries) return []

    const design = await this._file
    const allTargetIds = design.getTargetIds()
    const skipComponentsIfScoped = targetIds.length && !shouldFetchUsedComponents
    if (skipComponentsIfScoped) return []

    const librariesDescriptors = design.getRemoteComponentsDescriptorsByIds(allTargetIds.remoteComponents)

    return librariesDescriptors.map((descriptor) => {
      return new Library({ design: this, componentMeta: descriptor })
    })
  }

  async getLazyFillsDescriptor(): Promise<FillsDescriptor> {
    if (!this._fillsDescriptor) {
      this._fillsDescriptor = this.parser.qm.queues.fills.exec(this.designId).then((fillsDescriptor) => {
        return new FillsDescriptor({ fillsDescriptor: fillsDescriptor as FigmaFillsDescriptor })
      })
    }
    return this._fillsDescriptor
  }

  async frameLikes(): Promise<FrameLike[]> {
    await this._readyFrameLikes()
    return this._frameLikes
  }

  async libraries(): Promise<Library[]> {
    await this._readyLibraries()
    return this._libraries
  }

  async ready(): Promise<void> {
    await this._readyFrameLikes()
    await this._readyLibraries()
    return
  }

  async meta(): Promise<DesignMeta> {
    const design = await this._file
    return {
      schemaVersion: design.schemaVersion,
      name: design.name,
    }
  }
}
