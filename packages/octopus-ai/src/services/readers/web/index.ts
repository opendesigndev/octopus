import { PrivateData, ArtBoardRefs, ArtBoard } from '@opendesign/illustrator-parser-pdfcpu'
import { WASMContext } from '@opendesign/illustrator-parser-pdfcpu/wasm_context'

import { AIFileReaderCommon } from '../ai-file-reader-common.js'

import type { AdditionalTextData, RawArtboardEntry } from '../../../typings/raw/index.js'
import type { BitmapReader, WasmContext } from '@opendesign/illustrator-parser-pdfcpu/wasm_context'
import type { SourceImage } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

type AIFileReaderOptions = {
  /** Uint8Array representation of converted .ai file */
  file: Uint8Array
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
  private _context: WasmContext
  static async readFile(filePath: string): Promise<Uint8Array> {
    const response = await fetch(filePath)
    const buffer = await response.arrayBuffer()

    return new Uint8Array(buffer)
  }

  private _file: Uint8Array
  protected _images: Record<number, BitmapReader>

  /**
   * Converts given AI file into SourceDesign.
   * @constructor
   * @param {AIFileReaderOptions} options
   */
  constructor(options: AIFileReaderOptions) {
    super()

    this._file = options.file
  }

  private async _getContext(): Promise<WasmContext> {
    const data = this._file

    if (!this._context) {
      this._context = await WASMContext(data)
    }

    return this._context
  }

  protected async _getFileMeta() {
    const ctx = await this._getContext()
    return { version: ctx.aiFile.Version, name: ctx.aiFile.XRefTable.Title }
  }

  protected async _getSourceData(): Promise<RawSourceData> {
    const ctx = await this._getContext()
    this._images = ctx.Bitmaps

    const version = ctx.aiFile.Version
    const additionalTextData = (await PrivateData(ctx)) as unknown as AdditionalTextData

    const artboards = (await Promise.all(
      ArtBoardRefs(ctx).map(async (ref) => {
        const artboard = await ArtBoard(ctx, ref)
        return { ...artboard, Id: ref.idx }
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
