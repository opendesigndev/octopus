import { createParser } from '@avocode/figma-parser'

import type { Logger } from '@avocode/figma-parser/lib/src/services/logger/logger'
import type { ICacher } from '@avocode/figma-parser/lib/src/types/cacher'
// eslint-disable-next-line import/no-named-as-default
import type EventEmitter from 'eventemitter3'

export type SourceApiReaderOptions = {
  designId: string
  host: string
  token: string
  ids: string[]
  pixelsLimit: number
  framePreviews: boolean
  tokenType: string
  previewsParallels: number
  nodesParallels: number
  s3Parallels: number
  verbose: boolean
  figmaIdsFetchUsedComponents: boolean
  renderImagerefs: boolean
  shouldObtainLibraries: boolean
  shouldObtainStyles: boolean
  parallelRequests: number
  logger?: Logger
  cacher?: ICacher
}

export class SourceApiReader {
  private _options: SourceApiReaderOptions
  private _parser: ReturnType<typeof createParser>

  constructor(options: SourceApiReaderOptions) {
    this._options = options
    this._parser = this._initParser()
  }

  get designId(): string {
    return this._options.designId
  }

  get getFileMeta() {
    return this._parser.getFileMeta()
  }

  parse(ids?: string[]): EventEmitter {
    return this._parser.parse(ids)
  }

  private _initParser(): ReturnType<typeof createParser> {
    return createParser(this._options)
  }
}
