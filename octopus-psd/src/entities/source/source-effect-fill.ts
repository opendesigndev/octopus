import type { RawFill } from '../../typings/raw'
import { getColorFor } from '../../utils/source'
import { SourceEffectFillGradient } from './source-effect-fill-gradient'

export class SourceEffectFill {
  protected _fill: RawFill | undefined

  constructor(fill: RawFill | undefined) {
    this._fill = fill
  }

  get color() {
    return getColorFor(this._fill?.color)
  }

  get gradient() {
    return this._fill?.gradient ? new SourceEffectFillGradient(this._fill?.gradient) : undefined
  }

  get reverse() {
    return this._fill?.reverse ?? false
  }

  get align() {
    return this._fill?.align ?? true
  }

  get scale() {
    return (this._fill?.scale?.value ?? 100) / 100
  }

  get angle() {
    return this._fill?.Angl?.value ?? this._fill?.angle?.value ?? 0
  }

  get type() {
    return this._fill?.type
  }

  get pattern() {
    return this._fill?.pattern
  }
}
