import { RawSource } from '../typings/source'
import { RawArtboardEntry } from '../typings/source/artboard'
import SourceArtboard from './source-artboard'
import { Nullable } from '../typings/helpers'

type SourceDesignOptions = {
  artboards: RawArtboardEntry[]
}

export default class SourceDesign {
  private _artboards: SourceArtboard[]

  static fromRawSource(source: RawSource): SourceDesign {
    if (!source?.Root?.Pages?.Kids) {
      throw new Error('Missing "Kids" array entry from the source design.')
    }
    const options = {
      artboards: source.Root.Pages.Kids,
    }

    return new this(options)
  }

  constructor(options: SourceDesignOptions) {
    this._artboards = options.artboards.map((rawArtboard, index) => new SourceArtboard(rawArtboard, index + 1))
  }

  get artboards(): SourceArtboard[] {
    return this._artboards
  }

  getArtboardById(id: string): Nullable<SourceArtboard> {
    return this.artboards.find((entry) => entry.id === id) || null
  }
}
