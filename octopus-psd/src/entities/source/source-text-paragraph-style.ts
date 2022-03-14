import type { RawParagraphStyle } from '../../typings/raw'
import { SourceAlign } from '../../typings/source'
import { SourceEntity } from './source-entity'

export class SourceTextParagraphStyle extends SourceEntity {
  protected _rawValue: RawParagraphStyle | undefined

  constructor(text: RawParagraphStyle | undefined) {
    super(text)
    this._rawValue = text
  }

  get align(): SourceAlign {
    return this._rawValue?.align ?? 'left'
  }
}
