import { XDFileReaderCommon } from '../xd-file-reader-common.js'

import type { ArrayBufferEntry } from '../../../../../src/typings/index.js'

type XDFileReaderOptions = {
  file: Uint8Array
}

export class XDFileReader extends XDFileReaderCommon {
  private _file: Uint8Array
  private _decoder: TextDecoder

  constructor(options: XDFileReaderOptions) {
    super()
    this._file = options.file
    this._decoder = new TextDecoder()
  }

  protected _parseDecode(buf: Uint8Array) {
    return JSON.parse(this._decoder.decode(buf))
  }

  protected async _getFile(): Promise<Uint8Array> {
    return Promise.resolve(this._file)
  }

  protected async _processImage(entry: ArrayBufferEntry) {
    return {
      path: entry.path,
      getImageData: () => Promise.resolve(entry.content),
    }
  }

  async cleanup(): Promise<void> {
    return
  }
}
