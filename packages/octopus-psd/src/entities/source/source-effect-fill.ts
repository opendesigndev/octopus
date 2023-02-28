// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { DescriptorValueType, UnitFloatType } from '@webtoon/psd-ts'

import PROPS from '../../utils/prop-names.js'
import { getUnitRatioFor, getColor } from '../../utils/source.js'
import { SourceEffectBase } from './source-effect-base.js'
import { SourceEffectFillGradient } from './source-effect-fill-gradient.js'

import type { RawFillPattern, RawFill, RawOffset, RawGradientType } from '../../typings/raw/index.js'
import type { SourceColor } from '../../typings/source.js'

export class SourceEffectFill extends SourceEffectBase {
  protected _enabled: boolean | undefined
  declare _rawValue: RawFill | undefined

  constructor(raw: RawFill | undefined, enabled?: boolean) {
    super(raw)
    this._rawValue = raw
    this._enabled = enabled
  }

  get color(): SourceColor | null {
    return getColor(this._rawValue?.[PROPS.COLOR])
  }

  @firstCallMemo()
  get gradient(): SourceEffectFillGradient | undefined {
    const gradient = this._rawValue?.[PROPS.GRADIENT]
    return gradient ? new SourceEffectFillGradient(gradient) : undefined
  }

  get reverse(): boolean {
    return this._rawValue?.[PROPS.REVERSE] ?? false
  }

  get align(): boolean {
    return this._rawValue?.[PROPS.ALIGN] ?? true
  }

  get scale(): number {
    return getUnitRatioFor(this._rawValue?.[PROPS.SCALE])
  }

  get angle(): number {
    return this._rawValue?.[PROPS.ANGLE] ?? 0
  }

  get type(): RawGradientType | undefined {
    return this._rawValue?.Type?.trim() as RawGradientType | undefined
  }

  get pattern(): RawFillPattern | undefined {
    return this._rawValue?.[PROPS.PATTERN]
  }

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.[PROPS.OPACITY])
  }

  get offset(): RawOffset {
    return (
      this._rawValue?.[PROPS.OFFSET] ??
      this._rawValue?.phase ?? {
        Hrzn: { value: 0, unitType: UnitFloatType.Percent, type: DescriptorValueType.UnitFloat },
        Vrtc: { value: 0, unitType: UnitFloatType.Percent, type: DescriptorValueType.UnitFloat },
      }
    )
  }

  get enabled(): boolean {
    return this._enabled ?? this._rawValue?.[PROPS.ENABLED] ?? true
  }
}
