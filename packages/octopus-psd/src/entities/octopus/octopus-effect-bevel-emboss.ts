import { convertBlendMode } from '../../utils/convert.js'
import { OctopusEffectBase } from './octopus-effect-base.js'

import type { Octopus } from '../../typings/octopus.js'
import type { SourceEffectBevelEmboss } from '../source/source-effect-bevel-emboss.js'
import type { OctopusLayerBase } from './octopus-layer-base.js'

type OctopusEffectBevelEmbossOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectBevelEmboss
}

export class OctopusEffectBevelEmboss extends OctopusEffectBase {
  protected _parentLayer: OctopusLayerBase
  private _bevelEmboss: SourceEffectBevelEmboss

  constructor(options: OctopusEffectBevelEmbossOptions) {
    super(options)
    this._parentLayer = options.parentLayer
    this._bevelEmboss = options.effect
  }

  private get _otherEffectProperties() {
    return {
      otherEffectType: 'BEVEL_AND_EMBOSS',
      style: this._bevelEmboss.style,
      depth: this._bevelEmboss.depth,
      blur: this._bevelEmboss.blur,
      softness: this._bevelEmboss.softness,
      angle: this._bevelEmboss.localLightingAngle,
      altitude: this._bevelEmboss.localLightingAltitude,
      highlightMode: convertBlendMode(this._bevelEmboss.highlightMode),
      highlightColor: this._bevelEmboss.highlightColor,
      highlightOpacity: this._bevelEmboss.highlightOpacity,
      shadowMode: convertBlendMode(this._bevelEmboss.shadowMode),
      shadowColor: this._bevelEmboss.shadowColor,
      shadowOpacity: this._bevelEmboss.shadowOpacity,
    }
  }

  convert(): Octopus['EffectOther'] | null {
    const otherEffectProperties = this._otherEffectProperties
    const visible = this.visible
    const basis = 'FILL'
    return { type: 'OTHER', visible, basis, otherEffectProperties }
  }
}
