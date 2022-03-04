import type { Octopus } from '../../typings/octopus'
import type { SourceBounds } from '../../typings/source'
import { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { OctopusEffectOverlayColor } from './octopus-effect-overlay-color'
import { OctopusEffectOverlayGradient } from './octopus-effect-overlay-gradient'
import { OctopusEffectOverlayPattern } from './octopus-effect-overlay-pattern'
import { OctopusEffectStroke } from './octopus-effect-stroke'

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

  private get _effectOverlayPattern(): Octopus['EffectOverlay'] | null {
    if (this._effects.patternFill === undefined) return null
    return new OctopusEffectOverlayPattern({
      parentArtboard: this._parentArtboard,
      effects: this._effects,
      fill: this._effects.patternFill,
      sourceLayerBounds: this._sourceLayerBounds,
    }).convert()
  }

  private get _effectOverlayGradient(): Octopus['EffectOverlay'] | null {
    if (this._effects.gradientFill === undefined) return null
    return new OctopusEffectOverlayGradient({
      parentArtboard: this._parentArtboard,
      effects: this._effects,
      fill: this._effects.gradientFill,
      sourceLayerBounds: this._sourceLayerBounds,
    }).convert()
  }

  private get _effectOverlayColor(): Octopus['EffectOverlay'] | null {
    if (this._effects.solidFill === undefined) return null
    return new OctopusEffectOverlayColor({
      parentArtboard: this._parentArtboard,
      effects: this._effects,
      fill: this._effects.solidFill,
    }).convert()
  }

  private get _effectStroke(): Octopus['EffectStroke'] | null {
    if (this._effects.stroke === undefined) return null
    return new OctopusEffectStroke({
      parentArtboard: this._parentArtboard,
      effects: this._effects,
      stroke: this._effects.stroke,
      sourceLayerBounds: this._sourceLayerBounds,
    }).convert()
  }

  convert(): Octopus['Effect'][] {
    const effects = [] as Octopus['Effect'][]

    const overlayPattern = this._effectOverlayPattern
    if (overlayPattern != null) effects.push(overlayPattern)

    const overlayGradient = this._effectOverlayGradient
    if (overlayGradient != null) effects.push(overlayGradient)

    const overlayColor = this._effectOverlayColor
    if (overlayColor != null) effects.push(overlayColor)

    const stroke = this._effectStroke
    if (stroke != null) effects.push(stroke)

    return effects
  }
}
