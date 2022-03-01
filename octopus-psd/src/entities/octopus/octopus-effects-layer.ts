import type { Octopus } from '../../typings/octopus'
import { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { OctopusEffectOverlay } from './octopus-effect-overlay'

type OctopusEffectLayerOptions = {
  parentArtboard: OctopusArtboard
  effects: SourceLayerEffects
}

export class OctopusEffectsLayer {
  protected _parentArtboard: OctopusArtboard
  protected _effects: SourceLayerEffects

  constructor(options: OctopusEffectLayerOptions) {
    this._parentArtboard = options.parentArtboard
    this._effects = options.effects
  }

  get effectType(): Octopus['EffectType'] | null {
    if (this._effects.patternFill) return 'OVERLAY'
    return null
  }

  convert(): Octopus['Effect'][] {
    const effects = [] as Octopus['Effect'][]

    if (this._effects.patternFill) {
      const effectOverlay = new OctopusEffectOverlay({
        effects: this._effects,
        parentArtboard: this._parentArtboard,
        fill: this._effects.patternFill,
      }).convert()
      if (effectOverlay != null) effects.push(effectOverlay)
    }

    if (this._effects.solidFill) {
      const effectOverlay = new OctopusEffectOverlay({
        effects: this._effects,
        parentArtboard: this._parentArtboard,
        fill: this._effects.solidFill,
      }).convert()
      if (effectOverlay != null) effects.push(effectOverlay)
    }

    if (this._effects.gradientFill) {
      const effectOverlay = new OctopusEffectOverlay({
        effects: this._effects,
        parentArtboard: this._parentArtboard,
        fill: this._effects.gradientFill,
      }).convert()
      if (effectOverlay != null) effects.push(effectOverlay)
    }

    return effects
  }
}
