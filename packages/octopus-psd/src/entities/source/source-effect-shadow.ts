import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'

import { getColorFor, getUnitRatioFor } from '../../utils/source.js'
import { SourceEffectBase } from './source-effect-base.js'

import type { RawEffectShadow } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'

export class SourceEffectShadow extends SourceEffectBase {
  protected _rawValue: RawEffectShadow | undefined

  constructor(raw: RawEffectShadow | undefined) {
    super(raw)
  }

  get distance(): number {
    return asFiniteNumber(this._rawValue?.distance, 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.localLightingAngle?.value, 0)
  }

  get useGlobalAngle(): boolean {
    return this._rawValue?.useGlobalAngle ?? true
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get choke(): number {
    return asFiniteNumber(this._rawValue?.chokeMatte, 0)
  }

  get color(): SourceColor | null {
    return getColorFor(this._rawValue?.color)
  }

  get opacity(): number | undefined {
    return getUnitRatioFor(this._rawValue?.opacity?.value)
  }
}
