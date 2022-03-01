import type { Octopus } from '../../typings/octopus'
import type { SourceBounds } from '../../typings/source'
import { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { OctopusEffectOverlayColor } from './octopus-effect-overlay-color'
import { OctopusEffectOverlayGradient } from './octopus-effect-overlay-gradient'
import { OctopusEffectOverlayPattern } from './octopus-effect-overlay-pattern'

type OctopusEffectLayerOptions = {
  parentArtboard: OctopusArtboard
  sourceLayerBounds: SourceBounds
  effects: SourceLayerEffects
}

export class OctopusEffectsLayer {
  protected _parentArtboard: OctopusArtboard
  protected _sourceLayerBounds: SourceBounds
  protected _effects: SourceLayerEffects

  constructor(options: OctopusEffectLayerOptions) {
    this._parentArtboard = options.parentArtboard
    this._sourceLayerBounds = options.sourceLayerBounds
    this._effects = options.effects
  }

  get effectType(): Octopus['EffectType'] | null {
    if (this._effects.patternFill) return 'OVERLAY'
    return null
  }

  convert(): Octopus['Effect'][] {
    const effects = [] as Octopus['Effect'][]

    if (this._effects.patternFill) {
      const overlayPattern = new OctopusEffectOverlayPattern({
        effects: this._effects,
        parentArtboard: this._parentArtboard,
        fill: this._effects.patternFill,
      }).convert()
      if (overlayPattern != null) effects.push(overlayPattern)
    }
    if (this._effects.gradientFill) {
      const overlayGradient = new OctopusEffectOverlayGradient({
        effects: this._effects,
        parentArtboard: this._parentArtboard,
        sourceLayerBounds: this._sourceLayerBounds,
        fill: this._effects.gradientFill,
      }).convert()
      if (overlayGradient != null) effects.push(overlayGradient)
    }

    if (this._effects.solidFill) {
      const overlayColor = new OctopusEffectOverlayColor({
        effects: this._effects,
        parentArtboard: this._parentArtboard,
        fill: this._effects.solidFill,
      }).convert()
      if (overlayColor != null) effects.push(overlayColor)
    }

    return effects
  }
}
