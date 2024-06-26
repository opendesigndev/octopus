import { SourceEntity } from './source-entity.js'
import PROPS from '../../utils/prop-names.js'
import { getColor } from '../../utils/source.js'

import type { RawShapeGradientColor } from '../../typings/raw/index.js'
import type { SourceColor } from '../../typings/source.js'

export class SourceEffectFillGradientColor extends SourceEntity {
  declare _rawValue: RawShapeGradientColor | undefined

  static DEFAULT_COLOR: SourceColor = { r: 0, g: 0, b: 0 }

  constructor(raw: RawShapeGradientColor | undefined) {
    super(raw)
  }

  get color(): SourceColor {
    return getColor(this._rawValue?.[PROPS.COLOR]) ?? SourceEffectFillGradientColor.DEFAULT_COLOR
  }

  get location(): number {
    return this._rawValue?.[PROPS.LOCATION] || 0
  }
}
