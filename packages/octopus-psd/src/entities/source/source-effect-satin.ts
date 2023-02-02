import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import { getUnitRatioFor, getColor } from '../../utils/source.js'
import { SourceEffectBase } from './source-effect-base.js'

import type { RawEffectSatin } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'

export class SourceEffectSatin extends SourceEffectBase {
  protected _rawValue: RawEffectSatin | undefined

  constructor(raw: RawEffectSatin | undefined) {
    super(raw)
  }

  get color(): SourceColor | null {
    return getColor(this._rawValue?.Clr)
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get distance(): number {
    return asFiniteNumber(this._rawValue?.Dstn, 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.lagl, 0)
  }

  get opacity(): number {
    return round(getUnitRatioFor(this._rawValue?.Opct))
  }

  get invert(): boolean {
    return this._rawValue?.Invr ?? false
  }
}
