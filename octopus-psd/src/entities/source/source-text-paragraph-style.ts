import { SourceEntity } from './source-entity'

import type { RawParagraphStyle } from '../../typings/raw'
import type { SourceAlign } from '../../typings/source'

export class SourceTextParagraphStyle extends SourceEntity {
  protected _rawValue: RawParagraphStyle | undefined

  constructor(raw: RawParagraphStyle | undefined) {
    super(raw)
  }

  get align(): SourceAlign {
    return this._rawValue?.align ?? 'left'
  }
}
