import type { RawShapeGradientColors } from '../../typings/raw'
import { getColorFor } from '../../utils/source'

export class SourceEffectFillGradientColor {
  protected _colors: RawShapeGradientColors | undefined

  constructor(colors: RawShapeGradientColors | undefined) {
    this._colors = colors
  }

  get color() {
    return getColorFor(this._colors?.color)
  }

  get location() {
    return this._colors?.location || 0
  }
}
