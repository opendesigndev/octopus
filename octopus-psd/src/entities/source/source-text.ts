import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { getMatrixFor, getBoundsFor } from '../../utils/source'
import { SourceEntity } from './source-entity'
import { SourceTextParagraphStyleRange } from './source-text-paragraph-style-range'
import { SourceTextTextStyleRange } from './source-text-text-style-range'

import type { RawText } from '../../typings/raw'
import type { SourceBounds, SourceMatrix } from '../../typings/source'

export class SourceText extends SourceEntity {
  protected _rawValue: RawText | undefined

  static DEFAULT_ORIENTATION = 'horizontal' as const

  constructor(raw: RawText | undefined) {
    super(raw)
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
    return getBoundsFor(this._rawValue?.bounds)
  }

  get boundingBox(): SourceBounds {
    return getBoundsFor(this._rawValue?.boundingBox)
  }
}
