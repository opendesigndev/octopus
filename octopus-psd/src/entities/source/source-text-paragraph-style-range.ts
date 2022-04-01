import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawParagraphStyleRange } from '../../typings/raw'
import { SourceEntity } from './source-entity'
import { SourceTextParagraphStyle } from './source-text-paragraph-style'

export class SourceTextParagraphStyleRange extends SourceEntity {
  protected _rawValue: RawParagraphStyleRange | undefined

  constructor(text: RawParagraphStyleRange | undefined) {
    super(text)
    this._rawValue = text
  }

  get from(): number {
    return this._rawValue?.from ?? 0
  }

  get to(): number {
    return this._rawValue?.to ?? 0
  }

  @firstCallMemo()
  get paragraphStyle(): SourceTextParagraphStyle {
    return new SourceTextParagraphStyle(this._rawValue?.paragraphStyle)
  }
}
