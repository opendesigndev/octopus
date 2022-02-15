import type { RawFill } from '../../typings/raw'
import { getColorFor } from '../../utils/source'
import { SourceEffectFillGradient } from './source-effect-fill-gradient'

export class SourceEffectFill {
  protected _rawValue: RawFill | undefined

  constructor(fill: RawFill | undefined) {
    this._rawValue = fill
  }

  get color() {
    return getColorFor(this._rawValue?.color)
  }

  get gradient() {
    return this._rawValue?.gradient ? new SourceEffectFillGradient(this._rawValue?.gradient) : undefined
  }

  get reverse() {
    return this._rawValue?.reverse ?? false
  }

  get align() {
    return this._rawValue?.align ?? true
  }

  get scale() {
    return (this._rawValue?.scale?.value ?? 100) / 100
  }

  get angle() {
    return this._rawValue?.Angl?.value ?? this._rawValue?.angle?.value ?? 0
  }

  get type() {
    return this._rawValue?.type
  }

  get pattern() {
    return this._rawValue?.pattern
  }
}
