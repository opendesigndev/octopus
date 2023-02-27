import { SourceEntity } from './source-entity.js'
import { SourcePage } from './source-page.js'

import type { RawComponent, RawComponents, RawComponentSets, RawDesign, RawStyles } from '../../typings/raw/index.js'

type SourceDesignOptions = {
  raw?: RawDesign
  designId: string
}

export class SourceDesign extends SourceEntity {
  declare _rawValue: RawDesign
  private _designId: string
  private _pages: SourcePage[]

  constructor(options: SourceDesignOptions) {
    super(options.raw ?? {})
    this._pages = options.raw?.document?.children?.map((page) => new SourcePage(page)) ?? []
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

  get components(): RawComponents {
    return this._rawValue.components ?? {}
  }

  getComponentById(id: string): RawComponent | undefined {
    return this.components[id]
  }

  get componentSets(): RawComponentSets {
    return this._rawValue.componentSets ?? {}
  }

  get styles(): RawStyles {
    return this._rawValue.styles ?? {}
  }
}
