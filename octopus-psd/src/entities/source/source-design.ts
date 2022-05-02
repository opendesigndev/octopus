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
    this._artboard = new SourceArtboard(options.artboard)
    this._images = options.images
    this._designId = options.designId
  }

  get designId(): string {
    return this._designId
  }

  get artboard(): SourceArtboard {
    return this._artboard
  }

  get images(): SourceImage[] {
    return this._images
  }

  getImageByName(name: string): SourceImage | undefined {
    return this.images.find((image) => image.name === name)
  }

  get values(): {
    designId: string
    artboard: RawArtboard
    images: SourceImage[]
  } {
    return {
      designId: this.designId,
      artboard: this.artboard.raw,
      images: this.images,
    }
  }
}
