import type { Octopus } from '../../typings/octopus'
import type { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { SourceEffectShadow } from '../source/source-effect-shadow'
import { OctopusEffectShadowCommon } from './octopus-effect-shadow-common'

type OctopusShadowOptions = {
  parentArtboard: OctopusArtboard
  effects: SourceLayerEffects
  shadow: SourceEffectShadow
}

export class OctopusEffectShadowDrop extends OctopusEffectShadowCommon {
  protected _parentArtboard: OctopusArtboard
  protected _effects: SourceLayerEffects
  protected _shadow: SourceEffectShadow

  constructor(options: OctopusShadowOptions) {
    super(options)
    this._parentArtboard = options.parentArtboard
    this._effects = options.effects
    this._shadow = options.shadow
  }

  convert(): Octopus['EffectDropShadow'] | null {
    const shadow = this.shadowConfig
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'DROP_SHADOW', shadow, visible, blendMode, basis }
  }
}
