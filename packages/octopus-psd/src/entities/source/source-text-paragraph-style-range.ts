import { firstCallMemo } from '@opendesign/octopus-common/decorators/first-call-memo'

import { SourceEntity } from './source-entity'
import { SourceTextParagraphStyle } from './source-text-paragraph-style'

import type { RawParagraphStyleRange } from '../../typings/raw/index'

export class SourceTextParagraphStyleRange extends SourceEntity {
  protected _rawValue: RawParagraphStyleRange | undefined

  constructor(raw: RawParagraphStyleRange | undefined) {
    super(raw)
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
