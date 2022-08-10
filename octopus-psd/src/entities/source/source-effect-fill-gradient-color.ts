import { getColorFor } from '../../utils/source.js'
import { SourceEntity } from './source-entity.js'

import type { RawShapeGradientColor } from '../../typings/raw/index.js'
import type { SourceColor } from '../../typings/source.js'

export class SourceEffectFillGradientColor extends SourceEntity {
  protected _rawValue: RawShapeGradientColor | undefined

  static DEFAULT_COLOR: SourceColor = { r: 0, g: 0, b: 0 }

  constructor(raw: RawShapeGradientColor | undefined) {
    super(raw)
  }

  get color(): SourceColor {
    return getColorFor(this._rawValue?.color) ?? SourceEffectFillGradientColor.DEFAULT_COLOR
  }

  get location(): number {
    return this._rawValue?.location || 0
  }
}
