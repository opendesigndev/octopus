import { SourceDesign } from '../../entities/source/source-design.js'

import type { SourceImage, SourceTree } from '../../typings/index.js'
import type { AdditionalTextData, RawArtboardEntry } from '../../typings/raw/index.js'

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
export abstract class AIFileReaderCommon {
  protected _sourceDesign: Promise<SourceDesign>

  protected async _initSourceDesign(): Promise<SourceDesign> {
    return this._fromSourceTree(await this._createSourceTree())
  }

  protected abstract _getSourceData(file?: string): Promise<RawSourceData>

  /**
   * Cleans temporary directory where source.json and source images were saved.
   */
  protected abstract cleanup(): Promise<void>

  protected abstract _loadImages(): SourceImage[]

  public async _createSourceTree(): Promise<SourceTree> {
    const { artboards, additionalTextData, metadata } = await this._getSourceData()
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

  protected _fromSourceTree(sourceTree: SourceTree): SourceDesign | never {
    return new SourceDesign(sourceTree)
  }

  /**
   * Returns `SourceDesign` instance built from given design path using `@opendesign/illustrator-parser-pdfcpu`.
   * @returns {SourceDesign }
   */
  async getSourceDesign(): Promise<SourceDesign> {
    return this._fromSourceTree(await this._createSourceTree())
  }
}
