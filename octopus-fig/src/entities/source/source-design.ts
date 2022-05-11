import { push } from '@avocode/octopus-common/dist/utils/common'

import { SourceArtboard } from './source-artboard'
import { SourceEntity } from './source-entity'
import { SourcePage } from './source-page'

import type { RawPage, RawDesign } from '../../typings/raw'

export type SourceImage = {
  name: string
  path: string
  width?: number
  height?: number
}

type SourceDesignOptions = {
  raw: RawDesign
  images: SourceImage[]
  designId: string
}

export class SourceDesign extends SourceEntity {
  protected _rawValue: RawDesign
  private _designId: string
  private _pages: SourcePage[]
  private _images: SourceImage[]

  constructor(options: SourceDesignOptions) {
    super(options.raw)
    this._pages = options.raw.document?.children?.map((page) => new SourcePage(page)) ?? []
    this._images = options.images
    this._designId = options.designId
  }

  get designId(): string {
    return this._designId
  }

  get schemaVersion(): string | undefined {
    return this._rawValue.schemaVersion !== undefined ? String(this._rawValue.schemaVersion) : undefined
  }

  get name(): string | undefined {
    return this._rawValue.name
  }

  get pages(): SourcePage[] {
    return this._pages
  }

  getPageById(id: string): SourcePage | null {
    return this._pages.find((page) => page.id === id) ?? null
  }

  get images(): SourceImage[] {
    return this._images
  }

  getImageByName(name: string): SourceImage | undefined {
    return this.images.find((image) => image.name === name)
  }

  get artboards(): SourceArtboard[] {
    return this._pages.reduce((artboards, page) => push(artboards, ...page.children), [])
  }

  getArtboardById(id: string): SourceArtboard | null {
    return this.artboards.find((artboard) => artboard.id === id) || null
  }

  get values(): {
    designId: string
    pages: RawPage[]
    images: SourceImage[]
  } {
    return {
      designId: this.designId,
      pages: this._pages.map((page) => page.raw),
      images: this.images,
    }
  }
}
