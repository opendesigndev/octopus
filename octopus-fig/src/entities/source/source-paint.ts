import { round } from '@avocode/octopus-common/dist/utils/math'

import { getTransformFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

import type { RawBlendMode, RawColor, RawGradientType, RawPaint } from '../../typings/raw'
import type { SourceTransform } from '../../typings/source'

type SourcePaintOptions = {
  rawValue: RawPaint
}

export class SourcePaint extends SourceEntity {
  protected _rawValue: RawPaint

  constructor(options: SourcePaintOptions) {
    super(options.rawValue)
  }

  get type(): RawGradientType | undefined {
    return this._rawValue.type
  }

  get visible(): boolean {
    return this._rawValue.visible ?? true
  }

  get opacity(): number {
    return round(this._rawValue.opacity ?? 1)
  }

  get color(): RawColor | undefined {
    return this._rawValue.color
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue.blendMode
  }

  get imageTransform(): SourceTransform | null {
    return getTransformFor(this._rawValue.imageTransform)
  }
}
