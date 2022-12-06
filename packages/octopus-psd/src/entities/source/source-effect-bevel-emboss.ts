import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { getMapped } from '@opendesign/octopus-common/dist/utils/common.js'

import { getUnitRatioFor, getColor } from '../../utils/source.js'
import { OctopusEffectBevelEmboss } from '../octopus/octopus-effect-bevel-emboss.js'
import { SourceEffectBase } from './source-effect-base.js'

import type { RawEffectBevelEmboss } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'

export class SourceEffectBevelEmboss extends SourceEffectBase {
  protected _rawValue: RawEffectBevelEmboss | undefined

  constructor(raw: RawEffectBevelEmboss | undefined) {
    super(raw)
  }

  get style(): string | undefined {
    return getMapped(this._rawValue?.bvlS, OctopusEffectBevelEmboss.BEVEL_EMBOSS_TYPE_MAP, undefined)
  }

  get depth(): number | undefined {
    return getUnitRatioFor(this._rawValue?.srgR)
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get softness(): number {
    return asFiniteNumber(this._rawValue?.Sftn, 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.lagl)
  }

  get localLightingAltitude(): number {
    return asFiniteNumber(this._rawValue?.Lald, 0)
  }

  get highlightMode(): string | undefined {
    return this._rawValue?.hglM
  }

  get highlightColor(): SourceColor | null {
    return getColor(this._rawValue?.hglC)
  }

  get highlightOpacity(): number {
    return getUnitRatioFor(this._rawValue?.hglO)
  }

  get shadowMode(): string | undefined {
    return this._rawValue?.sdwM
  }

  get shadowColor(): SourceColor | null {
    return getColor(this._rawValue?.sdwC)
  }

  get shadowOpacity(): number {
    return getUnitRatioFor(this._rawValue?.sdwO)
  }
}
