import type { RawShapeGradientColors } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'
import { getColorFor } from '../../utils/source'

export class SourceEffectFillGradientColor {
  protected _rawValue: RawShapeGradientColors | undefined

  constructor(colors: RawShapeGradientColors | undefined) {
    this._rawValue = colors
  }

  get color(): SourceColor | null {
    return getColorFor(this._rawValue?.color)
  }

  get location(): number {
    return this._rawValue?.location || 0
  }
}
