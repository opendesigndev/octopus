import type { Octopus } from '../../typings/octopus'
import type { SourceEffectShadow } from '../source/source-effect-shadow'
import { OctopusEffectShadowCommon } from './octopus-effect-shadow-common'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusShadowOptions = {
  parentLayer: OctopusLayerBase
  shadow: SourceEffectShadow
}

export class OctopusEffectShadowInner extends OctopusEffectShadowCommon {
  constructor(options: OctopusShadowOptions) {
    super(options)
  }

  convert(): Octopus['EffectInnerShadow'] {
    const shadow = this.shadowConfig
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'INNER_SHADOW', shadow, visible, blendMode, basis }
  }
}
