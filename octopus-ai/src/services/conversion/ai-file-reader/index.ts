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

export type RawSourceData = {
  artboards: RawArtboardEntry[]
  additionalTextData: AdditionalTextData
  metadata: Metadata
}

export class AIFileReader {
  static RELATIVE_PATH_TO_ROOT = '../../../../'

  static getOutputResourcesBaseDir(): string {
    return path.join(__dirname, '../../../../', process.env.RESOURCES_DIR ?? '')
  }

  private _sourceDesign: Promise<SourceDesign>
  private _instanceResourcesDir: string
  private _images: Record<string, string>

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
    const additionalTextData = (await PrivateData(ctx)) as never as AdditionalTextData
    const artboards = (await Promise.all(
      ArtBoardRefs(ctx).map((ref) => {
        return ArtBoard(ctx, ref)
      })
    )) as never as RawArtboardEntry[]

    return { artboards, additionalTextData, metadata: { version } }
  }

  private async _loadImages(): Promise<Promise<SourceImage>[]> {
    const resourcesDirPath = this._instanceResourcesDir
    return Object.values(this._images)
      .map(async (imagePath) => {
        const imageId = path.basename(imagePath)
        const fullPath = `${resourcesDirPath}/bitmaps/${imageId}`

        try {
          return {
            id: imageId,
            path: fullPath,
            getImageData: () => fsp.readFile(fullPath),
          }
        } catch (_) {
          logger.error('Failed to read image:', fullPath)
          return null
        }
      })
      .filter((img) => !!img) as Promise<SourceImage>[]
  }

  private async _createSourceTree(filePath: string): Promise<SourceTree> {
    const { artboards, additionalTextData, metadata } = await this._getSourceData(filePath)

    const images = await Promise.all(await this._loadImages())
    if (!metadata) {
      throw new Error('Missing metada from file input')
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
