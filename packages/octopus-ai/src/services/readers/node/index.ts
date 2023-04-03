import fsp from 'fs/promises'
import os from 'os'
import path from 'path'

import { PrivateData, ArtBoardRefs, ArtBoard } from '@opendesign/illustrator-parser-pdfcpu'
import { FSContext } from '@opendesign/illustrator-parser-pdfcpu/fs_context'
import { v4 as uuidv4 } from 'uuid'

import { AIFileReaderCommon } from '../ai-file-reader-common.js'

import type { SourceImage } from '../../../typings/index.js'
import type { AdditionalTextData, RawArtboardEntry } from '../../../typings/raw/index.js'
import type { FsContext } from '@opendesign/illustrator-parser-pdfcpu/fs_context'

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
  protected _instanceResourcesDir: string
  private _resourcesDir: string
  private _path: string
  private _context: FsContext
  protected _images: Record<string, string>

  static BITMAPS_FOLDER_NAME = 'bitmaps'

  /**
   * Converts given AI file into SourceDesign.
   * @constructor
   * @param {AIFileReaderOptions} options
   */
  constructor(options: AIFileReaderOptions) {
    super()
    this._resourcesDir = path.join(os.tmpdir(), uuidv4())
    this._path = options.path
  }

  private async _getContext(): Promise<FsContext> {
    if (!this._context) {
      this._context = await FSContext({ file: this._path, workdir: this._resourcesDir })
    }

    return this._context
  }

  protected async _getFileMeta() {
    const ctx = await this._getContext()
    ctx.aiFile.XRefTable.Title = ctx.aiFile.XRefTable.Title || 'Untitled'
    return { version: ctx.aiFile.Version, name: ctx.aiFile.XRefTable.Title }
  }

  protected async _getSourceData(): Promise<RawSourceData> {
    await fsp.mkdir(this._resourcesDir, { recursive: true })

    const ctx = await this._getContext()

    this._instanceResourcesDir = ctx.BaseDir
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
    return fsp.rm(this._resourcesDir, { force: true, recursive: true })
  }

  protected _loadImages(): SourceImage[] {
    const resourcesDirPath = this._instanceResourcesDir

    return Object.values(this._images).map((imagePath) => {
      const imageId = path.basename(imagePath)
      const fullPath = path.join(resourcesDirPath, AIFileReader.BITMAPS_FOLDER_NAME, imageId)

      return {
        id: imageId,
        path: fullPath,
        getImageData: async () => {
          const data = await fsp.readFile(fullPath).catch((err) => {
            console.error('Failed to read image', fullPath)
            throw err
          })

          return new Uint8Array(data)
        },
      }
    })
  }
}
