import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'

import { getColorFor, getUnitRatioFor } from '../../utils/source.js'
import { SourceEffectBase } from './source-effect-base.js'

import type { RawEffectSatin } from '../../typings/raw/index.js'
import type { SourceColor } from '../../typings/source.js'

export class SourceEffectSatin extends SourceEffectBase {
  protected _rawValue: RawEffectSatin | undefined

  constructor(raw: RawEffectSatin | undefined) {
    super(raw)
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
