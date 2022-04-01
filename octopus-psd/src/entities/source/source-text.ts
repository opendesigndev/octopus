import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawText } from '../../typings/raw'
import type { SourceBounds, SourceMatrix } from '../../typings/source'
import { getMatrixFor, getTextBoundsFor } from '../../utils/source'
import { SourceEntity } from './source-entity'
import { SourceTextParagraphStyleRange } from './source-text-paragraph-style-range'
import { SourceTextTextStyleRange } from './source-text-text-style-range'

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
