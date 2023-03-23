import { SourceEntity } from './source-entity.js'
import PROPS from '../../utils/prop-names.js'
import { getUnitRatioFor } from '../../utils/source.js'

import type { RawShapeTransparency } from '../../typings/raw/index.js'

export class SourceEffectFillGradientOpacity extends SourceEntity {
  protected _rawValue: RawShapeTransparency

  constructor(raw: RawShapeTransparency | undefined) {
    super(raw)
  }

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.[PROPS.OPACITY])
  }

  get location(): number {
    return this._rawValue?.[PROPS.LOCATION] || 0
  }
}
