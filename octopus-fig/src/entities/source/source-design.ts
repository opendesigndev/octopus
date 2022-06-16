import { SourceEntity } from './source-entity'
import { SourcePage } from './source-page'

import type { RawPage, RawDesign } from '../../typings/raw'

export type SourceImage = {
  name: string
  path: string
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

  get raw(): RawDesign {
    return this._rawValue
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

  get images(): SourceImage[] {
    return this._images
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
