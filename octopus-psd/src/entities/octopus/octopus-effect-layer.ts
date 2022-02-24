import type { Octopus } from '../../typings/octopus'
import { SourceLayerEffect } from '../source/source-effect-layer'
import { OctopusEffectOverlay } from './octopus-effect-overlay'

type OctopusEffectLayerOptions = {
  effect: SourceLayerEffect
}

export class OctopusEffectLayer {
  protected _effect: SourceLayerEffect

  constructor(options: OctopusEffectLayerOptions) {
    this._effect = options.effect
  }

  get effectType(): Octopus['EffectType'] | null {
    if (this._effect.patternFill) return 'OVERLAY'
    return null
  }

  convert(): Octopus['Effect'] | null {
    const effect = this._effect
    switch (this.effectType) {
      case 'OVERLAY':
        return new OctopusEffectOverlay({ effect }).convert()
      default:
        return null
    }
  }
}
