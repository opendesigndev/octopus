import { OctopusEffectShadowCommon } from './octopus-effect-shadow-common.js'

import type { OctopusLayerBase } from './octopus-layer-base.js'
import type { Octopus } from '../../typings/octopus.js'
import type { SourceEffectShadow } from '../source/source-effect-shadow.js'

type OctopusGlowOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectShadow
}

export class OctopusEffectGlowInner extends OctopusEffectShadowCommon {
  constructor(options: OctopusGlowOptions) {
    super(options)
  }

  convert(): Octopus['EffectInnerGlow'] {
    const glow = this.shadowConfig
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'INNER_GLOW', glow, visible, blendMode, basis }
  }
}
