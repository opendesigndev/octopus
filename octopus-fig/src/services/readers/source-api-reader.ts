import { createParser } from '@avocode/figma-parser'

import type { Design } from '@avocode/figma-parser/lib/src/index-node'
import type { Logger } from '@avocode/figma-parser/lib/src/services/logger/logger'
import type { ICacher } from '@avocode/figma-parser/lib/src/types/cacher'

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
  private _design: Design
  private _parser: ReturnType<typeof createParser>

  constructor(options: SourceApiReaderOptions) {
    this._options = options
    this._parser = this._initParser()
  }

  get designId(): string {
    return this._options.designId
  }

  get frameLikeIds() {
    return this._parser.getFrameLikeIds()
  }

  parse(ids?: string[]): Design {
    return this._parser.parse(ids)
  }

  private _initParser(): ReturnType<typeof createParser> {
    return createParser(this._options)
  }
}
