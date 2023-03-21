import { PrivateData, ArtBoardRefs, ArtBoard } from '@opendesign/illustrator-parser-pdfcpu'
import { WASMContext } from '@opendesign/illustrator-parser-pdfcpu/wasm_context'

import { AIFileReaderCommon } from '../ai-file-reader-common.js'

import type { SourceImage } from '../../../typings/index.js'
import type { AdditionalTextData, RawArtboardEntry } from '../../../typings/raw/index.js'
import type { BitmapReader } from '@opendesign/illustrator-parser-pdfcpu/wasm_context'

type AIFileReaderOptions = {
  /** Path to the .ai file. */
  path: string
}

export type Metadata = {
  version: string
}

export type RawSourceData = {
  artboards: RawArtboardEntry[]
  additionalTextData: AdditionalTextData
  metadata: Metadata
}

/**
 * Reader that converts Adobe Illustrator file into `SourceDesign` object.
 */
export class AIFileReader extends AIFileReaderCommon {
  static async readFile(filePath: string): Promise<Uint8Array> {
    const response = await fetch(filePath)
    const buffer = await response.arrayBuffer()

    return new Uint8Array(buffer)
  }

  private _promisedData: Promise<Uint8Array>
  protected _images: Record<number, BitmapReader>

  /**
   * Converts given AI file into SourceDesign.
   * @constructor
   * @param {AIFileReaderOptions} options
   */
  constructor(options: AIFileReaderOptions) {
    super()
    const promisedData = AIFileReader.readFile(options.path)

    this._promisedData = promisedData
  }

  protected async _getSourceData(): Promise<RawSourceData> {
    const data = await this._promisedData
    const ctx = await WASMContext(data)
    this._images = ctx.Bitmaps
    const version = ctx.aiFile.Version
    const additionalTextData = (await PrivateData(ctx)) as unknown as AdditionalTextData

    const artboards = (await Promise.all(
      ArtBoardRefs(ctx).map((ref) => {
        return ArtBoard(ctx, ref)
      })
    )) as unknown as RawArtboardEntry[]

    return { artboards, additionalTextData, metadata: { version } }
  }

  /**
   * Cleans temporary directory where source.json and source images were saved.
   */
  async cleanup(): Promise<void> {
    return Promise.resolve()
  }

  protected _loadImages(): SourceImage[] {
    return Object.entries(this._images).map(([id, BitmapReader]) => {
      return {
        id,
        getImageData: async () => {
          const image = await BitmapReader()
          return image.content
        },
      }
    })
  }
}
