import type { RawShapeTransparency } from '../../typings/raw'
import { getUnitRatioFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

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
