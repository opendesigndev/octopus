import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'

import PROPS from '../../utils/prop-names.js'
import { getUnitRatioFor, getColor } from '../../utils/source.js'
import { SourceEffectBase } from './source-effect-base.js'

import type { RawEffectShadow } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'

export class SourceEffectShadow extends SourceEffectBase {
  protected _rawValue: RawEffectShadow | undefined

  constructor(raw: RawEffectShadow | undefined) {
    super(raw)
    this._rawValue = raw
  }

  get distance(): number {
    return asFiniteNumber(this._rawValue?.[PROPS.DISTANCE], 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.[PROPS.LOCAL_LIGHT_ANGLE], 0)
  }

  get useGlobalAngle(): boolean {
    return this._rawValue?.uglg ?? true
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get choke(): number {
    return asFiniteNumber(this._rawValue?.[PROPS.CHOKE_MATTE], 0)
  }

  get color(): SourceColor | null {
    return getColor(this._rawValue?.[PROPS.COLOR])
  }

  get opacity(): number | undefined {
    return getUnitRatioFor(this._rawValue?.[PROPS.OPACITY], 0)
  }
}
