import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import type { RawBlendMode, RawFill, RawFillPattern } from '../../typings/raw'
import type { SourceColor, SourceGradientType, SourceVectorXY } from '../../typings/source'
import { getColorFor, getUnitRatioFor } from '../../utils/source'
import { SourceEffectFillGradient } from './source-effect-fill-gradient'

export class SourceEffectFill {
  protected _rawValue: RawFill | undefined

  constructor(fill: RawFill | undefined) {
    this._rawValue = fill
  }

  get color(): SourceColor | null {
    return getColorFor(this._rawValue?.color)
  }

  @firstCallMemo()
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
    return getUnitRatioFor(this._rawValue?.scale?.value)
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

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.opacity?.value)
  }

  offset(width: number, height: number): SourceVectorXY {
    const { horizontal: h, vertical: v } = this._rawValue?.offset ?? this._rawValue?.phase ?? {}
    if (typeof h === 'number' && typeof v === 'number') return { x: h, y: v }
    if (typeof h === 'number' || typeof v === 'number') return { x: 0, y: 0 }
    if (h?.value !== undefined && v?.value !== undefined) {
      const x = (h.value * width) / 100
      const y = (v.value * height) / 100
      return { x, y }
    }
    return { x: 0, y: 0 }
  }
}
