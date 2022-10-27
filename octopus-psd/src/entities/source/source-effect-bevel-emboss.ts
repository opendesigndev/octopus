import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as'

import { getColorFor, getUnitRatioFor } from '../../utils/source'
import { SourceEffectBase } from './source-effect-base'

import type { RawBlendMode, RawEffectBevelEmboss } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'

export class SourceEffectBevelEmboss extends SourceEffectBase {
  protected _rawValue: RawEffectBevelEmboss | undefined

  constructor(raw: RawEffectBevelEmboss | undefined) {
    super(raw)
  }

  get style(): string | undefined {
    return this._rawValue?.bevelStyle
  }

  get depth(): number | undefined {
    return getUnitRatioFor(this._rawValue?.strengthRatio?.value)
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get softness(): number {
    return asFiniteNumber(this._rawValue?.softness, 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.localLightingAngle?.value, 0)
  }

  get localLightingAltitude(): number {
    return asFiniteNumber(this._rawValue?.localLightingAltitude?.value, 0)
  }

  get highlightMode(): RawBlendMode | undefined {
    return this._rawValue?.highlightMode
  }

  get highlightColor(): SourceColor | null {
    return getColorFor(this._rawValue?.highlightColor)
  }

  get highlightOpacity(): number {
    return getUnitRatioFor(this._rawValue?.highlightOpacity?.value)
  }

  get shadowMode(): RawBlendMode | undefined {
    return this._rawValue?.shadowMode
  }

  get shadowColor(): SourceColor | null {
    return getColorFor(this._rawValue?.shadowColor)
  }

  get shadowOpacity(): number {
    return getUnitRatioFor(this._rawValue?.shadowOpacity?.value)
  }
}
