import { createParser } from '@opendesign/figma-parser'

import type { AbstractReader } from './abstract-reader'
import type { Logger } from '@opendesign/figma-parser/lib/src/services/logger/logger'
import type { ICacher } from '@opendesign/figma-parser/lib/src/types/cacher'
// eslint-disable-next-line import/no-named-as-default
import type EventEmitter from 'eventemitter3'

export type SourceApiReaderOptions = {
  /** Figma design HASH ID */
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

/**
 * Reader that downloads given design from Figma API and provide them through `EventEmitter` calls.
 */
export class SourceApiReader implements AbstractReader {
  private _options: SourceApiReaderOptions
  private _parser: ReturnType<typeof createParser>

  /**
   * Creates SourceApiReader that downloads given Figma designs from Figma API.
   * @constructor
   * @param {SourceApiReaderOptions} options
   */
  constructor(options: SourceApiReaderOptions) {
    this._options = options
    this._parser = this._initParser()
  }

  /**
   * Figma design hash.
   * Can be found in the URL of the design: `https://www.figma.com/file/__DESIGN_HASH__`
   * @returns {string} returns Figma design hash
   */
  get designId(): string {
    return this._options.designId
  }

  get getFileMeta() {
    return this._parser.getFileMeta()
  }

  /**
   * Returns `EventEmitter` which is needed in OctopusFigConverter.
   * @param {string[]} [ids] Optional IDs of wanted artboards. If not provided, whole design will be parsed.
   * @returns {EventEmitter} returns `EventEmitter` providing source data to the OctopusFigConverter
   */
  parse(ids?: string[]): EventEmitter {
    return this._parser.parse(ids)
  }

  private _initParser(): ReturnType<typeof createParser> {
    return createParser(this._options)
  }
}
