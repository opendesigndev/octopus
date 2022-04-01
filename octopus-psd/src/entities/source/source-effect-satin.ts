import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'

import type { RawEffectSatin } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'
import { getColorFor, getUnitRatioFor } from '../../utils/source'
import { SourceEffectBase } from './source-effect-base'

export class SourceEffectSatin extends SourceEffectBase {
  protected _rawValue: RawEffectSatin | undefined

  constructor(raw: RawEffectSatin | undefined) {
    super(raw)
    this._rawValue = raw
  }

  get color(): SourceColor | null {
    return getColorFor(this._rawValue?.color)
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get distance(): number {
    return asFiniteNumber(this._rawValue?.distance, 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.localLightingAngle?.value, 0)
  }

  get opacity(): number {
    return getUnitRatioFor(this._rawValue?.opacity?.value)
  }

  get invert(): boolean {
    return this._rawValue?.invert ?? false
  }
}
