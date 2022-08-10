import { SourceEntity } from './source-entity.js'

import type { RawParagraphStyle } from '../../typings/raw/index.js'
import type { SourceAlign } from '../../typings/source.js'

export class SourceTextParagraphStyle extends SourceEntity {
  protected _rawValue: RawParagraphStyle | undefined

  constructor(raw: RawParagraphStyle | undefined) {
    super(raw)
  }

  get align(): SourceAlign {
    return this._rawValue?.align ?? 'left'
  }
}
