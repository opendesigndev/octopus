import { mod, round } from '@opendesign/octopus-common/dist/utils/math.js'

import { SourceEntity } from './source-entity.js'
import { getColorFor, getTransformFor } from '../../utils/source.js'

import type { RawGradientType, RawImageFilters, RawPaint, RawScaleMode, RawStop } from '../../typings/raw/paint.js'
import type { RawBlendMode } from '../../typings/raw/shared.js'
import type { SourceGradientPositions, SourceColor, SourceTransform } from '../../typings/source.js'

type SourcePaintOptions = {
  rawValue: RawPaint
}

export class SourcePaint extends SourceEntity {
  declare _rawValue: RawPaint

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

  get rotation(): number | undefined {
    const rotation = this._rawValue.rotation ?? 0
    const result = mod(-rotation, 360)
    return result ? result : undefined
  }

  get scalingFactor(): number {
    return round(this._rawValue.scalingFactor ?? 1)
  }

  get gradientStops(): RawStop[] {
    return this._rawValue.gradientStops ?? []
  }

  get gradientHandlePositions(): SourceGradientPositions | null {
    const [p1, p2, p3] = this._rawValue.gradientHandlePositions ?? []
    if ([p1?.x, p1?.y, p2?.x, p2?.y, p3?.x, p3?.y].includes(undefined)) return null
    return [p1, p2, p3] as SourceGradientPositions
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
