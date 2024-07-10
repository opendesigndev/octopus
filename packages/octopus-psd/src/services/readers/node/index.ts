import { readFile } from 'fs/promises'

import { getRenderer } from '@opendesign/image-icc-profile-converter'
import Jimp from 'jimp'

import { PSDFileReaderCommon } from '../psd-file-reader-common.js'

import type { ConvertImageOptions } from '../psd-file-reader-common.js'
import type { Renderer } from '@opendesign/image-icc-profile-converter'

export type PSDFileReaderOptions = WithRendererOptions & {
  /** wasm image processing tool */
  renderer?: Renderer
}

export type WithRendererOptions = {
  /** Path to the .psd design file. */
  path: string
}

/**
 * Reader that converts Adobe Photoshop .psd file into `SourceDesign` object.
 */
export class PSDFileReader extends PSDFileReaderCommon {
  private _path: string

  static async withRenderer(options: WithRendererOptions): Promise<PSDFileReader> {
    if (!PSDFileReaderCommon._renderer) {
      PSDFileReaderCommon._renderer = await getRenderer()
    }

    return new PSDFileReader({ ...options, renderer: PSDFileReaderCommon._renderer })
  }

  /**
   * Converts given PSD file into SourceDesign.
   * @constructor
   * @param {PSDFileReaderOptions} options
   */
  constructor(options: PSDFileReaderOptions) {
    super({ ...options })
    this._path = options.path
  }

  protected async _getBuffer(): Promise<Uint8Array> {
    const buffer = await readFile(this._path)
    return new Uint8Array(buffer)
  }

  protected async _convertImage({ width, height, buff, id, iccProfile }: ConvertImageOptions): Promise<void> {
    const processedBuff = this._renderer && iccProfile ? this._renderer.render(buff, iccProfile) : buff

    const image = new Jimp(width, height)
    const scanned = image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (_x, _y, index) {
      this.bitmap.data[index + 0] = processedBuff[index + 0]
      this.bitmap.data[index + 1] = processedBuff[index + 1]
      this.bitmap.data[index + 2] = processedBuff[index + 2]
      this.bitmap.data[index + 3] = processedBuff[index + 3]
    })

    const parsed = new Jimp(scanned)
    this._images.push({ width, height, id, promisedData: parsed.getBufferAsync(Jimp.MIME_PNG) })

    return
  }
}
