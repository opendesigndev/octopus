import type { RawFillGradient } from '../../typings/raw'
import { SourceEffectFillGradientColor } from './source-effect-fill-gradient-color'

export class SourceEffectFillGradient {
  protected _gradient: RawFillGradient | undefined

  constructor(gradient: RawFillGradient | undefined) {
    this._gradient = gradient
  }

  get colors() {
    return this._gradient?.colors?.map((color) => new SourceEffectFillGradientColor(color))
  }
}
