import { OctopusEffectShadowCommon } from './octopus-effect-shadow-common.js'

import type { Octopus } from '../../typings/octopus.js'
import type { SourceEffectShadow } from '../source/source-effect-shadow.js'
import type { OctopusLayerBase } from './octopus-layer-base.js'

type OctopusShadowOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectShadow
}

export class OctopusEffectShadowDrop extends OctopusEffectShadowCommon {
  constructor(options: OctopusShadowOptions) {
    super(options)
  }

  convert(): Octopus['EffectDropShadow'] {
    const shadow = this.shadowConfig
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'DROP_SHADOW', shadow, visible, blendMode, basis }
  }
}
