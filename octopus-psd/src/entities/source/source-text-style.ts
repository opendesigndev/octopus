import type { RawTextStyle } from '../../typings/raw'
import { SourceEntity } from './source-entity'

export class SourceTextStyle extends SourceEntity {
  protected _rawValue: RawTextStyle | undefined

  constructor(text: RawTextStyle | undefined) {
    super(text)
    this._rawValue = text
  }

  get fontPostScriptName(): string {
    return this._rawValue?.fontPostScriptName ?? ''
  }

  get fontName(): string | undefined {
    return this._rawValue?.fontName
  }

  get fontStyleName(): string | undefined {
    return this._rawValue?.fontStyleName
  }
}
