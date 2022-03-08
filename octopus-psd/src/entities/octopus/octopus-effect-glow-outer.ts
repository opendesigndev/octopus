import type { Octopus } from '../../typings/octopus'
import type { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { SourceEffectShadow } from '../source/source-effect-shadow'
import { OctopusEffectShadowCommon } from './octopus-effect-shadow-common'

type OctopusGlowOptions = {
  parentArtboard: OctopusArtboard
  effects: SourceLayerEffects
  shadow: SourceEffectShadow
}

export class OctopusEffectGlowOuter extends OctopusEffectShadowCommon {
  protected _parentArtboard: OctopusArtboard
  protected _effects: SourceLayerEffects
  protected _shadow: SourceEffectShadow

  constructor(options: OctopusGlowOptions) {
    super(options)
    this._parentArtboard = options.parentArtboard
    this._effects = options.effects
    this._shadow = options.shadow
  }

  convert(): Octopus['EffectOuterGlow'] | null {
    const glow = this.shadowConfig
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OUTER_GLOW', glow, visible, blendMode, basis }
  }
}
