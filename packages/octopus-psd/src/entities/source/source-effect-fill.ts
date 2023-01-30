import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { DescriptorValueType, UnitFloatType } from '@webtoon/psd-ts'

import { getUnitRatioFor, getColor } from '../../utils/source.js'
import { SourceEffectBase } from './source-effect-base.js'
import { SourceEffectFillGradient } from './source-effect-fill-gradient.js'

import type { RawFillPattern, RawFill, RawOffset } from '../../typings/raw'
import type { SourceColor, SourceGradientType } from '../../typings/source'

export class SourceEffectFill extends SourceEffectBase {
  protected _enabled: boolean | undefined
  protected _rawValue: RawFill | undefined

  constructor(raw: RawFill | undefined, enabled?: boolean) {
    super(raw)
    this._rawValue = raw
    this._enabled = enabled
  }

  get color(): SourceColor | null {
    return getColor(this._rawValue?.Clr)
  }

  @firstCallMemo()
  get gradient(): SourceEffectFillGradient | undefined {
    return this._rawValue?.Grad ? new SourceEffectFillGradient(this._rawValue?.Grad) : undefined
  }

  get reverse(): boolean {
    return this._rawValue?.Rvrs ?? false
  }

  get align(): boolean {
    return this._rawValue?.Algn ?? true
  }

  get scale(): number {
    return getUnitRatioFor(this._rawValue?.Scl)
  }

  get angle(): number {
    return this._rawValue?.Angl ?? 0
  }

  get type(): SourceGradientType | undefined {
    return this._rawValue?.Type?.trim() as SourceGradientType | undefined
  }

  get pattern(): RawFillPattern | undefined {
    return this._rawValue?.Ptrn
  }

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.Opct)
  }

  get offset(): RawOffset {
    return (
      this._rawValue?.Ofst ??
      this._rawValue?.phase ?? {
        Hrzn: { value: 0, unitType: UnitFloatType.Percent, type: DescriptorValueType.UnitFloat },
        Vrtc: { value: 0, unitType: UnitFloatType.Percent, type: DescriptorValueType.UnitFloat },
      }
    )
  }

  get enabled(): boolean {
    return this._enabled ?? this._rawValue?.enab ?? true
  }
}
