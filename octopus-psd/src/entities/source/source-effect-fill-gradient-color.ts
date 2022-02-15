import type { RawShapeGradientColors } from '../../typings/raw'
import { getColorFor } from '../../utils/source'

export class SourceEffectFillGradientColor {
  protected _rawValue: RawShapeGradientColors | undefined

  constructor(colors: RawShapeGradientColors | undefined) {
    this._rawValue = colors
  }

  get color() {
    return getColorFor(this._rawValue?.color)
  }

  get location() {
    return this._rawValue?.location || 0
  }
}
