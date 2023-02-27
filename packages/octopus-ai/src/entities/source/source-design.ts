import { uniqueIdFactory } from '../../utils/layer.js'
import { SourceArtboard } from './source-artboard.js'

import type { Metadata } from '../../services/conversion/ai-file-reader/index.js'
import type { SourceImage, SourceTree } from '../../typings/index.js'
import type { AdditionalTextData } from '../../typings/raw/index.js'
import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

export class SourceDesign {
  private _artboards: SourceArtboard[]
  private _images: SourceImage[]
  private _metaData: Metadata
  private _additionalTexData: AdditionalTextData
  private _uniqueId: () => string

  constructor(sourceTree: SourceTree) {
    this._uniqueId = uniqueIdFactory(0)
    this._artboards = sourceTree.artboards.map(
      (artboardSource) => new SourceArtboard({ artboard: artboardSource, sourceDesign: this })
    )
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

  get uniqueId() {
    return this._uniqueId
  }
}
