import { SourceArtboard } from './source-artboard'
import type { RawArtboard } from '../../typings/raw'

export type SourceImage = {
  name: string
  path: string
  width?: number
  height?: number
}

type SourceDesignOptions = {
  artboard: RawArtboard
  images: SourceImage[]
  designId: string
}

export class SourceDesign {
  private _designId: string
  private _artboard: SourceArtboard
  private _images: SourceImage[]

  constructor(options: SourceDesignOptions) {
    this._artboard = new SourceArtboard({ rawValue: options.artboard })
    this._images = options.images
    this._designId = options.designId
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
