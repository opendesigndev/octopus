import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import PROPS from '../../utils/prop-names.js'
import { getUnitRatioFor, getColor } from '../../utils/source.js'
import { SourceEffectBase } from './source-effect-base.js'

import type { RawEffectSatin } from '../../typings/raw/index.js'
import type { SourceColor } from '../../typings/source.js'

export class SourceEffectSatin extends SourceEffectBase {
  declare _rawValue: RawEffectSatin | undefined

  constructor(raw: RawEffectSatin | undefined) {
    super(raw)
  }

  get color(): SourceColor | null {
    return getColor(this._rawValue?.[PROPS.COLOR])
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get distance(): number {
    return asFiniteNumber(this._rawValue?.[PROPS.DISTANCE], 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.[PROPS.LOCAL_LIGHT_ANGLE], 0)
  }

  get opacity(): number {
    return round(getUnitRatioFor(this._rawValue?.[PROPS.OPACITY]))
  }

  get invert(): boolean {
    return this._rawValue?.Invr ?? false
  }
}
