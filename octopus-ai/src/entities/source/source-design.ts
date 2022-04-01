import SourceArtboard from './source-artboard'
import SourceMetadata from './source-metadata'

import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'
import type { RawSourceRootOcProperties } from '../../typings/raw'
import type { SourceImage, SourceTree } from '../../typings'
import type { AdditionalTextData } from '../../typings/additional-text-data'

export default class SourceDesign {
  private _artboards: SourceArtboard[]
  private _images: SourceImage[]
  private _ocProperties: RawSourceRootOcProperties
  private _metaData: SourceMetadata
  private _additionalTexData: Nullable<AdditionalTextData>

  constructor(sourceTree: SourceTree) {
    this._artboards = sourceTree.artboards.map(
      (rawArtboard, index) => new SourceArtboard(rawArtboard, String(index + 1))
    )
    this._metaData = new SourceMetadata(sourceTree.metadata)
    this._images = sourceTree.images
    this._ocProperties = sourceTree.ocProperties
    this._additionalTexData = sourceTree.additionalTextData
  }

  get metadaData(): SourceMetadata {
    return this._metaData
  }

  get images(): SourceImage[] {
    return this._images
  }

  get ocProperties(): RawSourceRootOcProperties {
    return this._ocProperties
  }

  get artboards(): SourceArtboard[] {
    return this._artboards
  }

  get additionalTextData(): Nullable<AdditionalTextData> {
    return this._additionalTexData
  }

  getArtboardById(id: string): Nullable<SourceArtboard> {
    return this.artboards.find((entry) => entry.id === id) || null
  }
}
