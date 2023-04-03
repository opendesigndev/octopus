import { SourceDesign } from '../../entities/source/source-design.js'

import type { SourceImage, SourceTree } from '../../typings/index.js'
import type { AdditionalTextData, RawArtboardEntry } from '../../typings/raw/index.js'
import type { DesignMeta } from '@opendesign/octopus-common/dist/typings/octopus-common/index.js'

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
  protected abstract _getSourceData(file?: string): Promise<RawSourceData>

  /**
   * Cleans temporary directory where source.json and source images were saved.
   */
  protected abstract cleanup(): Promise<void>

  protected abstract _loadImages(): SourceImage[]
  private _sourceTree?: SourceTree

  private async _getSourceTree(): Promise<SourceTree> {
    if (!this._sourceTree) {
      this._sourceTree = await this._createSourceTree()
    }
    return this._sourceTree
  }

  protected abstract _getFileMeta(): Promise<{ name: string; version: string }>

  async getDesignMeta(): Promise<DesignMeta> {
    const { artboards } = await this._getSourceTree()

    const components = artboards.map((artboard) => {
      return { id: artboard.Id?.toString() ?? '', name: artboard.Name ?? '', role: 'ARTBOARD' as const }
    })

    const { name, version } = await this._getFileMeta()

    return {
      name,
      origin: { name: 'ILLUSTRATOR', version },
      pages: [],
      components,
    }
  }

  private async _createSourceTree(): Promise<SourceTree> {
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

  /**
   * Returns `SourceDesign` instance built from given design path using `@opendesign/illustrator-parser-pdfcpu`.
   * @returns {SourceDesign }
   */
  async getSourceDesign({ ids }: { ids?: string[] } = {}): Promise<SourceDesign> {
    return new SourceDesign(await this._getSourceTree(), ids)
  }
}
