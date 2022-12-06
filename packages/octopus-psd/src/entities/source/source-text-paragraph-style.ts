import { SourceEntity } from './source-entity.js'

import type { ParagraphRunDataParagraphSheetProperties } from '../../typings/raw'
import type { SourceAlign } from '../../typings/source'

export class SourceTextParagraphStyle extends SourceEntity {
  protected _rawValue: ParagraphRunDataParagraphSheetProperties | undefined

  static JUSTIFICATION_VALUES = [
    'left',
    'right',
    'center',
    'justifyLeft',
    'justifyRight',
    'justifyCenter',
    'justifyAll',
  ] as const

  constructor(raw: ParagraphRunDataParagraphSheetProperties | undefined) {
    super(raw)
  }

  get align(): SourceAlign {
    return SourceTextParagraphStyle.JUSTIFICATION_VALUES[this._rawValue?.Justification ?? 0]
  }
}
