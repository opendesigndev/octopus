import { SourceEntity } from './source-entity'
import { SourcePage } from './source-page'

import type { RawPage, RawDesign } from '../../typings/raw'

type SourceDesignOptions = {
  raw: RawDesign
  designId: string
}

export class SourceDesign extends SourceEntity {
  protected _rawValue: RawDesign
  private _designId: string
  private _pages: SourcePage[]

  constructor(options: SourceDesignOptions) {
    super(options.raw)
    this._pages = options.raw.document?.children?.map((page) => new SourcePage(page)) ?? []
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

  get values(): {
    designId: string
    pages: RawPage[]
  } {
    return {
      designId: this.designId,
      pages: this._pages.map((page) => page.raw),
    }
  }
}
