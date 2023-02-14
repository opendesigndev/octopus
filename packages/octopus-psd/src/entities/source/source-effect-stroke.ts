import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import PROPS from '../../utils/prop-names.js'
import { SourceEffectBase } from './source-effect-base.js'
import { SourceEffectFill } from './source-effect-fill.js'

import type { RawEffectStroke, RawEffectStrokeLineAlignment } from '../../typings/raw'

export class SourceEffectStroke extends SourceEffectBase {
  protected _rawValue: RawEffectStroke | undefined

  static DEFAULT_LINE_ALIGNMENT = 'centeredFrame' as const
  static LINE_ALIGNMENT_MAP = {
    OutF: 'outsetFrame',
    InsF: 'insetFrame',
    CtrF: 'centeredFrame',
  } as const

  constructor(raw: RawEffectStroke | undefined) {
    super(raw)
    this._rawValue = raw
  }

  @firstCallMemo()
  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue)
  }

  get lineWidth(): number {
    return this._rawValue?.Sz ?? 0
  }

  get lineAlignment(): RawEffectStrokeLineAlignment {
    const styleKey = this._rawValue?.[PROPS.STYLE]
    return styleKey
      ? SourceEffectStroke.LINE_ALIGNMENT_MAP[styleKey as keyof typeof SourceEffectStroke.LINE_ALIGNMENT_MAP] ??
          SourceEffectStroke.DEFAULT_LINE_ALIGNMENT
      : SourceEffectStroke.DEFAULT_LINE_ALIGNMENT
  }
}
