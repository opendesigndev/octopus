import { createParser } from '@avocode/figma-parser/lib/src/index-node'

import { ENV } from '../general/environment'

import type { Design } from '@avocode/figma-parser/lib/src/index-node'

type SourceApiReaderOptions = {
  designId: string
}

export class SourceApiReader {
  private _designId: string
  private _design: Promise<Design | null>

  constructor(options: SourceApiReaderOptions) {
    this._designId = options.designId
    this._design = this._initSourceDesign()
  }

  get designId(): string {
    return this._designId
  }

  async designPromise(): Promise<Design | null> {
    return this._design
  }

  private async _initSourceDesign(): Promise<Design | null> {
    const token = ENV.API_TOKEN
    if (!token) return null

    const parser = createParser({
      designId: this.designId,
      token,
      ids: [],
      host: 'api.figma.com',
      pixelsLimit: 1e7,
      framePreviews: true,
      previewsParallels: 3,
      tokenType: 'personal',
      nodesParallels: 10,
      s3Parallels: 10,
      verbose: true,
      figmaIdsFetchUsedComponents: true,
      renderImagerefs: false,
      shouldObtainLibraries: true,
      shouldObtainStyles: true,
      parallelRequests: 5,
    })

    return parser.parse()
  }
}
