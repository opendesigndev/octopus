import { SourceArtboard } from './source-artboard'

import type { Metadata } from '../../services/conversion/ai-file-reader'
import type { SourceImage, SourceTree } from '../../typings'
import type { AdditionalTextData } from '../../typings/raw'
import type { Nullish } from '@avocode/octopus-common/dist/utils/utility-types'

export class SourceDesign {
  private _artboards: SourceArtboard[]
  private _images: SourceImage[]
  private _metaData: Metadata
  private _additionalTexData: AdditionalTextData

  constructor(sourceTree: SourceTree) {
    this._artboards = sourceTree.artboards.map((artboardSource) => new SourceArtboard(artboardSource))
    this._images = sourceTree.images
    this._additionalTexData = sourceTree.additionalTextData
    this._metaData = sourceTree.metadata
  }

  get metadaData(): Metadata {
    return this._metaData
  }

  get images(): SourceImage[] {
    return this._images
  }

  get artboards(): SourceArtboard[] {
    return this._artboards
  }

  get additionalTextData(): AdditionalTextData {
    return this._additionalTexData
  }

  getArtboardById(id: string): Nullish<SourceArtboard> {
    return this.artboards.find((entry) => entry.id === id) || null
  }
}
