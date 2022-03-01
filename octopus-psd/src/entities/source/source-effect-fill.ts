import type { RawBlendMode, RawFill, RawFillPattern } from '../../typings/raw'
import type { SourceColor, SourceGradientType, SourcePointXY } from '../../typings/source'
import { convertOpacity, convertScale } from '../../utils/convert'
import { getColorFor } from '../../utils/source'
import { SourceEffectFillGradient } from './source-effect-fill-gradient'

export class SourceEffectFill {
  protected _rawValue: RawFill | undefined

  constructor(fill: RawFill | undefined) {
    this._rawValue = fill
  }

  get color(): SourceColor | null {
    return getColorFor(this._rawValue?.color)
  }

  get gradient(): SourceEffectFillGradient | undefined {
    return this._rawValue?.gradient ? new SourceEffectFillGradient(this._rawValue?.gradient) : undefined
  }

  get reverse(): boolean {
    return this._rawValue?.reverse ?? false
  }

  get align(): boolean {
    return this._rawValue?.align ?? true
  }

  get scale(): number {
    return convertScale(this._rawValue?.scale?.value)
  }

  get angle(): number {
    return this._rawValue?.Angl?.value ?? this._rawValue?.angle?.value ?? 0
  }

  get type(): SourceGradientType | undefined {
    return this._rawValue?.type
  }

  get pattern(): RawFillPattern | undefined {
    return this._rawValue?.pattern
  }

  get enabled(): boolean {
    return this._rawValue?.enabled ?? true
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue?.mode
  }

  get opacity(): number | undefined {
    return convertOpacity(this._rawValue?.opacity?.value)
  }

  get offset(): SourcePointXY | undefined {
    const { horizontal, vertical } = this._rawValue?.phase ?? {}
    return horizontal !== undefined && vertical !== undefined ? { x: horizontal, y: vertical } : undefined
  }
}
