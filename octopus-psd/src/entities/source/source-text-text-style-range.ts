import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawTextStyleRange } from '../../typings/raw'
import { SourceEntity } from './source-entity'
import { SourceTextTextStyle } from './source-text-text-style'

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
