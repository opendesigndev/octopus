import { getUnitRatioFor } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'

import type { RawShapeTransparency } from '../../typings/raw'

export class SourceEffectFillGradientOpacity extends SourceEntity {
  protected _rawValue: RawShapeTransparency

  constructor(raw: RawShapeTransparency | undefined) {
    super(raw)
  }

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.Opct)
  }

  get location(): number {
    return this._rawValue?.Lctn || 0
  }
}
