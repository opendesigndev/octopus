import type { Octopus } from '../../typings/octopus'
import type { SourceEffectShadow } from '../source/source-effect-shadow'
import { OctopusEffectShadowCommon } from './octopus-effect-shadow-common'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusGlowOptions = {
  parentLayer: OctopusLayerBase
  shadow: SourceEffectShadow
}

export class OctopusEffectGlowOuter extends OctopusEffectShadowCommon {
  constructor(options: OctopusGlowOptions) {
    super(options)
  }

  convert(): Octopus['EffectOuterGlow'] {
    const glow = this.shadowConfig
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OUTER_GLOW', glow, visible, blendMode, basis }
  }
}
