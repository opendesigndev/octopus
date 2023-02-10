import { firstCallMemo } from '@opendesign/octopus-common/decorators/first-call-memo'

import { SourceEntity } from './source-entity'
import { SourceTextTextStyle } from './source-text-text-style'

import type { RawTextStyleRange } from '../../typings/raw/index'

export class SourceTextTextStyleRange extends SourceEntity {
  protected _rawValue: RawTextStyleRange | undefined

  constructor(raw: RawTextStyleRange | undefined) {
    super(raw)
  }

  get from(): number {
    return this._rawValue?.from ?? 0
  }

  get to(): number {
    return this._rawValue?.to ?? 0
  }

  @firstCallMemo()
  get textStyle(): SourceTextTextStyle {
    return new SourceTextTextStyle(this._rawValue?.textStyle)
  }
}
