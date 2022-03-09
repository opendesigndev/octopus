import type { RawText } from '../../typings/raw'
import { getMatrixFor, getTextBoundsFor } from '../../utils/source'
import type { SourceBounds, SourceMatrix } from '../../typings/source'
import { SourceEntity } from './source-entity'
import { SourceTextTextStyleRange } from './source-text-text-style-range'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import { SourceTextParagraphStyleRange } from './source-text-paragraph-style-range'

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

  @firstCallMemo()
  get textStyles(): SourceTextTextStyleRange[] {
    const ranges = this._rawValue?.textStyleRange ?? []
    return ranges.map((range) => new SourceTextTextStyleRange(range))
  }

  @firstCallMemo()
  get paragraphStyles(): SourceTextParagraphStyleRange[] {
    const ranges = this._rawValue?.paragraphStyleRange ?? []
    return ranges.map((range) => new SourceTextParagraphStyleRange(range))
  }

  get bounds(): SourceBounds {
    return getTextBoundsFor(this._rawValue?.bounds)
  }

  get boundingBox(): SourceBounds {
    return getTextBoundsFor(this._rawValue?.boundingBox)
  }
}
