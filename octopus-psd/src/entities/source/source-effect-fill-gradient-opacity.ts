import type { RawShapeTransparency } from '../../typings/raw'
import { getUnitRatioFor } from '../../utils/source'

export class SourceEffectFillGradientOpacity {
  private _rawValue: RawShapeTransparency | undefined

  constructor(opacity: RawShapeTransparency | undefined) {
    this._rawValue = opacity
  }

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.opacity?.value)
  }

  get location(): number {
    return this._rawValue?.location || 0
  }
}
