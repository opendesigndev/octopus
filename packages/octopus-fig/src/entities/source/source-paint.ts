import { round } from '@opendesign/octopus-common/dist/utils/math'

import { getColorFor, getTransformFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

import type { Octopus } from '../../typings/octopus'
import type { RawBlendMode, RawGradientType, RawImageFilters, RawPaint, RawScaleMode, RawStop } from '../../typings/raw'
import type { SourceColor, SourceTransform } from '../../typings/source'

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

  get color(): SourceColor | undefined {
    return getColorFor(this._rawValue.color)
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue.blendMode
  }

  get scaleMode(): RawScaleMode | undefined {
    return this._rawValue.scaleMode
  }

  get imageTransform(): SourceTransform | null {
    return getTransformFor(this._rawValue.imageTransform)
  }

  get scalingFactor(): number {
    return round(this._rawValue.scalingFactor ?? 1)
  }

  get gradientStops(): RawStop[] {
    return this._rawValue.gradientStops ?? []
  }

  get gradientHandlePositions(): [Octopus['Vec2'], Octopus['Vec2'], Octopus['Vec2']] | null {
    const [p1, p2, p3] = this._rawValue.gradientHandlePositions ?? []
    if ([p1?.x, p1?.y, p2?.x, p2?.y, p3?.x, p3?.y].includes(undefined)) return null
    return [p1, p2, p3] as [Octopus['Vec2'], Octopus['Vec2'], Octopus['Vec2']]
  }

  get gradientTransform(): SourceTransform | null {
    return getTransformFor(this._rawValue.gradientTransform)
  }

  get imageRef(): string | undefined {
    return this._rawValue.imageRef
  }

  get filters(): RawImageFilters | undefined {
    return this._rawValue.filters
  }
}
