import fsp from 'fs/promises'
import path from 'path'

import { FSContext } from '@opendesign/illustrator-parser-pdfcpu/dist/fs_context'
import { PrivateData, ArtBoardRefs, ArtBoard } from '@opendesign/illustrator-parser-pdfcpu/dist/index'

import { SourceDesign } from '../../../entities/source/source-design'
import { logger } from '../../../services/instances/logger'

import type { SourceImage, SourceTree } from '../../../typings'
import type { AdditionalTextData, RawArtboardEntry } from '../../../typings/raw'

type AIFileReaderOptions = {
  path: string
}

export type Metadata = {
  version: string
}

export type RawArtboardSource = {
  artboard: RawArtboardEntry
  id: string
}

export type RawSourceData = {
  artboards: RawArtboardSource[]
  additionalTextData: AdditionalTextData
  metadata: Metadata
}

export class AIFileReader {
  private _sourceDesign: Promise<SourceDesign>
  private _instanceResourcesDir: string
  private _images: Record<string, string>

  static BITMAPS_FOLDER_NAME = 'bitmaps'

  static getOutputResourcesBaseDir(): string {
    if (!process.env.RESOURCES_DIR) {
      throw new Error('Resources Directory not set')
    }

    return process.env.RESOURCES_DIR
  }

  constructor(options: AIFileReaderOptions) {
    this._sourceDesign = this._initSourceDesign(options.path)
  }

  private async _initSourceDesign(filePath: string): Promise<SourceDesign> {
    return this._fromSourceTree(await this._createSourceTree(filePath))
  }

  private async _getSourceData(file: string): Promise<RawSourceData> {
    const resourcesDir = AIFileReader.getOutputResourcesBaseDir()
    const ctx = await FSContext({ file, workdir: resourcesDir })

    this._instanceResourcesDir = ctx.BaseDir
    this._images = ctx.Bitmaps

    const version = ctx.aiFile.Version
    const additionalTextData = (await PrivateData(ctx)) as unknown as AdditionalTextData
    const artboards = (await Promise.all(
      ArtBoardRefs(ctx).map(async (ref) => {
        return { artboard: await ArtBoard(ctx, ref), id: String(ref.idx) }
      })
    )) as unknown as RawArtboardSource[]

    return { artboards, additionalTextData, metadata: { version } }
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

  get sourceDesign(): Promise<SourceDesign> {
    return this._sourceDesign
  }
}
