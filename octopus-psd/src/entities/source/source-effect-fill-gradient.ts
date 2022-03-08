import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import type { RawFillGradient } from '../../typings/raw'
import { SourceEffectFillGradientColor } from './source-effect-fill-gradient-color'

export class SourceEffectFillGradient {
  protected _rawValue: RawFillGradient | undefined

  constructor(gradient: RawFillGradient | undefined) {
    this._rawValue = gradient
  }

  @firstCallMemo()
  get colors(): SourceEffectFillGradientColor[] | undefined {
    return this._rawValue?.colors?.map((color) => new SourceEffectFillGradientColor(color))
  }
}
