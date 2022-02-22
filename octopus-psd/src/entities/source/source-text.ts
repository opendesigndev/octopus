import type { RawText } from '../../typings/raw'
import { getMatrixFor } from '../../utils/source'
import type { SourceMatrix } from '../../typings/source'
import { SourceEntity } from './source-entity'
import { SourceTextStyleRange } from './source-text-style-range'

export class SourceText extends SourceEntity {
  protected _rawValue: RawText | undefined

  static DEFAULT_ORIENTATION = 'horizontal' as const

  constructor(text: RawText | undefined) {
    super(text)
    this._rawValue = text
  }

  get textKey(): string {
    return this._rawValue?.textKey ?? ''
  }
  get orientation(): 'horizontal' | 'vertical' {
    return this._rawValue?.orientation ?? SourceText.DEFAULT_ORIENTATION
  }

  get transform(): SourceMatrix {
    return getMatrixFor(this._rawValue?.transform)
  }

  get textStyles(): SourceTextStyleRange[] {
    const textStyles = this._rawValue?.textStyleRange ?? []
    return textStyles.map((style) => new SourceTextStyleRange(style))
  }
}
