import fsp from 'fs/promises'
import os from 'os'
import path from 'path'

import { FSContext } from '@opendesign/illustrator-parser-pdfcpu/dist/fs_context'
import { PrivateData, ArtBoardRefs, ArtBoard } from '@opendesign/illustrator-parser-pdfcpu/dist/index'
import { v4 as uuidv4 } from 'uuid'

import { SourceDesign } from '../../../entities/source/source-design'
import { logger } from '../../../services/instances/logger'

import type { SourceImage, SourceTree } from '../../../typings'
import type { AdditionalTextData, RawArtboardEntry } from '../../../typings/raw'

type AIFileReaderOptions = {
  /** Path to the .ai file. */
  path: string
  /** Path to directory where output is temporarily saved */
  resourcesDir?: string
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
export class AIFileReader {
  private _sourceDesign: Promise<SourceDesign>
  private _instanceResourcesDir: string
  private _images: Record<string, string>
  private _resourcesDir: string

  static BITMAPS_FOLDER_NAME = 'bitmaps'

  /**
   * Converts given AI file into SourceDesign.
   * @constructor
   * @param {AIFileReaderOptions} options
   */
  constructor(options: AIFileReaderOptions) {
    this._resourcesDir = path.join(os.tmpdir(), uuidv4())
    this._sourceDesign = this._initSourceDesign(options.path)
  }

  private async _initSourceDesign(filePath: string): Promise<SourceDesign> {
    return this._fromSourceTree(await this._createSourceTree(filePath))
  }

  private async _getSourceData(file: string): Promise<RawSourceData> {
    await fsp.mkdir(this._resourcesDir, { recursive: true })

    const ctx = await FSContext({ file, workdir: this._resourcesDir })

    this._instanceResourcesDir = ctx.BaseDir
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
    return fsp.rm(this._resourcesDir, { force: true, recursive: true })
  }

  private _loadImages(): SourceImage[] {
    const resourcesDirPath = this._instanceResourcesDir

    return Object.values(this._images).map((imagePath) => {
      const imageId = path.basename(imagePath)
      const fullPath = path.join(resourcesDirPath, AIFileReader.BITMAPS_FOLDER_NAME, imageId)

      return {
        id: imageId,
        path: fullPath,
        getImageData: () =>
          fsp.readFile(fullPath).catch((err) => {
            logger.error('Failed to read image', fullPath)
            throw err
          }),
      }
    })
  }

  private async _createSourceTree(filePath: string): Promise<SourceTree> {
    const { artboards, additionalTextData, metadata } = await this._getSourceData(filePath)

    const images = this._loadImages()

    if (!metadata) {
      throw new Error('Missing metadata from file input')
    }

    if (!artboards?.length) {
      throw new Error('Missing artboards from source design')
    }

    if (!additionalTextData) {
      throw new Error('SourceDesign created without additionalTextData')
    }

    return {
      metadata,
      images,
      artboards,
      additionalTextData,
    }
  }

  private _fromSourceTree(sourceTree: SourceTree): SourceDesign | never {
    return new SourceDesign(sourceTree)
  }

  /**
   * Returns `SourceDesign` instance built from given design path using `@opendesign/illustrator-parser-pdfcpu`.
   * @returns {SourceDesign }
   */
  get sourceDesign(): Promise<SourceDesign> {
    return this._sourceDesign
  }
}
