import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawEffectStroke, RawEffectStrokeLineAlignment } from '../../typings/raw'
import { SourceEffectBase } from './source-effect-base'
import { SourceEffectFill } from './source-effect-fill'

export class SourceEffectStroke extends SourceEffectBase {
  protected _rawValue: RawEffectStroke | undefined

  static DEFAULT_LINE_ALIGNMENT = 'centeredFrame' as const

  constructor(stroke: RawEffectStroke | undefined) {
    super(stroke)
    this._rawValue = stroke
  }

  @firstCallMemo()
  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue)
  }

  get lineWidth(): number {
    return this._rawValue?.size ?? 0
  }

  get lineAlignment(): RawEffectStrokeLineAlignment {
    return this._rawValue?.style ?? SourceEffectStroke.DEFAULT_LINE_ALIGNMENT
  }
}
