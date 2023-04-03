import { getRenderer } from '@opendesign/image-icc-profile-converter'

import { PSDFileReaderCommon } from '../psd-file-reader-common'

import type { ConvertImageOptions } from '../psd-file-reader-common'
import type { Renderer } from '@opendesign/image-icc-profile-converter'

export type PSDFileReaderOptions = WithRendererOptions & {
  /** wasm image processing tool */
  renderer?: Renderer
}

export type WithRendererOptions = {
  /** Uint8Array representation of converted .psd file */
  file: Uint8Array
}

export class PSDFileReader extends PSDFileReaderCommon {
  private _file: Uint8Array

  static async withRenderer(options: WithRendererOptions): Promise<PSDFileReaderCommon> {
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
    this._file = options.file
  }

  protected async _getBuffer(): Promise<Uint8Array> {
    return Promise.resolve(this._file)
  }

  protected async _convertImage({ width, height, buff, name, iccProfile }: ConvertImageOptions): Promise<void> {
    const processedBuff = this._renderer && iccProfile ? this._renderer.render(buff, iccProfile) : buff

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')

    if (!context) {
      console.error('Error processing image: could not create context')
      return
    }

    const imageData = context.createImageData(width, height)
    const pixelData = new Uint8ClampedArray(processedBuff)
    imageData.data.set(pixelData)

    const promisedData = new Promise<Uint8Array>((resolve, reject) => {
      canvas.toBlob((blob) => {
        const fileReader = new FileReader()
        fileReader.onload = () => {
          if (!fileReader.result) {
            reject(new Error('Could not read image data'))
            return
          }
          const result = new Uint8Array(fileReader.result as ArrayBuffer)

          resolve(result)
        }

        if (!blob) {
          reject(new Error('Could not read image data'))
          return
        }

        fileReader.readAsArrayBuffer(blob)
      }, 'image/png')
    })
    this._images.push({ width, height, name, promisedData })

    return
  }
}
