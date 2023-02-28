import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { getMapped } from '@opendesign/octopus-common/dist/utils/common.js'

import { isBlendMode } from '../../utils/blend-modes.js'
import PROP_NAMES from '../../utils/prop-names.js'
import { getUnitRatioFor, getColor } from '../../utils/source.js'
import { OctopusEffectBevelEmboss } from '../octopus/octopus-effect-bevel-emboss.js'
import { SourceEffectBase } from './source-effect-base.js'

import type { RawEffectBevelEmboss } from '../../typings/raw/index.js'
import type { SourceColor } from '../../typings/source.js'
import type BLEND_MODES from '../../utils/blend-modes.js'

export class SourceEffectBevelEmboss extends SourceEffectBase {
  declare _rawValue: RawEffectBevelEmboss | undefined

  constructor(raw: RawEffectBevelEmboss | undefined) {
    super(raw)
  }

  get style(): string | undefined {
    return getMapped(this._rawValue?.bvlS, OctopusEffectBevelEmboss.BEVEL_EMBOSS_TYPE_MAP, undefined)
  }

  get depth(): number | undefined {
    return getUnitRatioFor(this._rawValue?.[PROP_NAMES.STRENGTH_RATIO])
  }

  get blur(): number {
    return asFiniteNumber(this._rawValue?.blur, 5)
  }

  get softness(): number {
    return asFiniteNumber(this._rawValue?.[PROP_NAMES.SOFTNESS], 0)
  }

  get localLightingAngle(): number {
    return asFiniteNumber(this._rawValue?.[PROP_NAMES.LOCAL_LIGHT_ANGLE])
  }

  get localLightingAltitude(): number {
    return asFiniteNumber(this._rawValue?.[PROP_NAMES.LOCAL_LIGHTING_ALTITUDE], 0)
  }

  get highlightMode(): keyof typeof BLEND_MODES | undefined {
    const highlightMode = this._rawValue?.[PROP_NAMES.HIGHLIGHT_MODE]
    return isBlendMode(highlightMode) ? highlightMode : undefined
  }

  get highlightColor(): SourceColor | null {
    return getColor(this._rawValue?.[PROP_NAMES.HIGHLIGHT_COLOR])
  }

  get highlightOpacity(): number {
    return getUnitRatioFor(this._rawValue?.[PROP_NAMES.HIGHLIGHT_OPACITY])
  }

  get shadowMode(): keyof typeof BLEND_MODES | undefined {
    const shadowMode = this._rawValue?.[PROP_NAMES.SHADOW_MODE]
    return isBlendMode(shadowMode) ? shadowMode : undefined
  }

  get shadowColor(): SourceColor | null {
    return getColor(this._rawValue?.[PROP_NAMES.SHADOW_COLOR])
  }

  get shadowOpacity(): number {
    return getUnitRatioFor(this._rawValue?.[PROP_NAMES.SHADOW_OPACITY])
  }
}
