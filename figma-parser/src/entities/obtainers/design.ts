import { EventEmitter } from 'eventemitter3'

import { File } from '../structural/file'
import { FrameLike } from './frame-like'

import type { Parser } from '../../parser'
import type { NodeAddress } from '../../services/requests-manager/nodes-endpoint'
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
  private _resources: {
    frameLikes: Promise<FrameLike[]>
  }

  constructor(options: DesignOptions) {
    super()
    this._designId = options.designId
    this._parser = options.parser
    this._file = this._initFile()
    this._resources = {
      frameLikes: this._initFrameLikes(),
    }
  }

  private _createTargetDesignIds(ids: string[]): NodeAddress[] {
    return ids.map((id) => ({ nodeId: id, designId: this._designId }))
  }

  private async _initFrameLikes() {
    const targetIds = this._createTargetDesignIds(await this._getTargetIds())
    const nodesRaw = this._parser.qm.queues.partialSync.execMany(targetIds)
    return Promise.all(
      nodesRaw.map(async (nodeRequest, index) => {
        const node = (await nodeRequest) as FigmaNode
        const frameLike = new FrameLike({
          node,
          id: targetIds[index],
          design: this,
        })
        frameLike.ready().then(() => {
          this.emit('ready:frame-like', frameLike)
        })
        return frameLike
      })
    )
  }

  private async _getTargetIds() {
    const file = await this._file
    const { topLevelArtboards, localComponents } = file.getScopedTargetIds(this._parser.config.targetIds)
    const { targetIds, shouldFetchUsedComponents } = this._parser.config
    const skipComponentsIfScoped = targetIds.length && !shouldFetchUsedComponents
    const localComponentsIds = skipComponentsIfScoped ? [] : localComponents
    return [...topLevelArtboards, ...localComponentsIds]
  }

  private async _initFile(): Promise<File> {
    const cachedDesign = await this._parser.services.cacher?.resolveDesign?.()
    if (cachedDesign) {
      return new File({ file: cachedDesign })
    }

    const url = this._parser.rm.file.prepareRequest(this._designId)
    console.log(url)
    const design = (await this.parser.downloader.getJSON(url)) as FigmaFile

    this._parser.services.cacher?.cacheDesign?.(this._designId, design)
    return new File({ file: design })
  }

  get parser(): Parser {
    return this._parser
  }

  async meta(): Promise<DesignMeta> {
    const design = await this._file
    return {
      schemaVersion: design.schemaVersion,
      name: design.name,
    }
  }
}
