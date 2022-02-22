import type { RawTextStyleRange } from '../../typings/raw'
import { SourceEntity } from './source-entity'
import { SourceTextStyle } from './source-text-style'

export class SourceTextStyleRange extends SourceEntity {
  protected _rawValue: RawTextStyleRange | undefined

  constructor(text: RawTextStyleRange | undefined) {
    super(text)
    this._rawValue = text
  }

  get from(): number {
    return this._rawValue?.from ?? 0
  }
  get to(): number {
    return this._rawValue?.to ?? 0
  }

  get textStyle(): SourceTextStyle {
    return new SourceTextStyle(this._rawValue?.textStyle)
  }
}
