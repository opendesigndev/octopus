import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { getColorFor, getUnitRatioFor } from '../../utils/source'
import { SourceEffectBase } from './source-effect-base'
import { SourceEffectFillGradient } from './source-effect-fill-gradient'

import type { RawFill, RawFillPattern } from '../../typings/raw'
import type { SourceColor, SourceGradientType, SourceOffset } from '../../typings/source'

export class SourceEffectFill extends SourceEffectBase {
  protected _rawValue: RawFill | undefined
  protected _enabled: boolean | undefined

  constructor(raw: RawFill | undefined, enabled?: boolean) {
    super(raw)
    this._enabled = enabled
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

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.opacity?.value)
  }

  get offset(): SourceOffset {
    return this._rawValue?.offset ?? this._rawValue?.phase ?? { horizontal: 0, vertical: 0 }
  }

  get enabled(): boolean {
    return this._enabled ?? this._rawValue?.enabled ?? true
  }
}
