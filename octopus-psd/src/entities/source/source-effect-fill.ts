import type { RawFill, RawFillPattern } from '../../typings/raw'
import type { SourceColor, SourceGradientType } from '../../typings/source'
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
    return (this._rawValue?.scale?.value ?? 100) / 100
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
}
