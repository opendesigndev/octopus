import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceEntity } from './source-entity.js'
import { SourceTextParagraphStyle } from './source-text-paragraph-style.js'

import type { RawParagraphStyleRange } from '../../typings/raw/index.js'

export class SourceTextParagraphStyleRange extends SourceEntity {
  declare _rawValue: RawParagraphStyleRange | undefined

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
