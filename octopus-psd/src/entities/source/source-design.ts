import { SourceArtboard } from './source-artboard'
import type { RawArtboard } from '../../typings/raw'
import type { OctopusPSDConverter } from '../..'

export type SourceImage = {
  name: string
  path: string
  width?: number
  height?: number
}

type SourceDesignOptions = {
  octopusConverter: OctopusPSDConverter
  artboard: RawArtboard
  images: SourceImage[]
  designId: string
}

export class SourceDesign {
  private _designId: string
  private _converter: OctopusPSDConverter
  private _artboard: SourceArtboard
  private _images: SourceImage[]

  constructor(options: SourceDesignOptions) {
    this._converter = options.octopusConverter
    this._artboard = new SourceArtboard({ rawValue: options.artboard, octopusConverter: options.octopusConverter })
    this._images = options.images
    this._designId = options.designId
  }

  get converter(): OctopusPSDConverter {
    return this._converter
  }

  get images(): SourceImage[] {
    return this._images
  }

  get designId(): string {
    return this._designId
  }

  get artboard(): SourceArtboard {
    return this._artboard
  }
}
