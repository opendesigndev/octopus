import { getUnitRatioFor } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'

import type { RawShapeTransparency } from '../../typings/raw/index.js'

export class SourceEffectFillGradientOpacity extends SourceEntity {
  protected _rawValue: RawShapeTransparency | undefined

  constructor(raw: RawShapeTransparency | undefined) {
    super(raw)
  }

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.opacity?.value)
  }

  get location(): number {
    return this._rawValue?.location || 0
  }
}
