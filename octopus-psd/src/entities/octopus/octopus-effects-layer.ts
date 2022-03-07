import type { Octopus } from '../../typings/octopus'
import type { SourceBounds } from '../../typings/source'
import { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { OctopusEffectGlowInner } from './octopus-effect-glow-inner'
import { OctopusEffectGlowOuter } from './octopus-effect-glow-outer'
import { OctopusEffectOverlayColor } from './octopus-effect-overlay-color'
import { OctopusEffectOverlayGradient } from './octopus-effect-overlay-gradient'
import { OctopusEffectOverlayPattern } from './octopus-effect-overlay-pattern'
import { OctopusEffectShadowDrop } from './octopus-effect-shadow-drop'
import { OctopusEffectShadowInner } from './octopus-effect-shadow-inner'
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

  private get _effectDropShadow(): Octopus['EffectDropShadow'] | null {
    if (this._effects.dropShadow === undefined) return null
    return new OctopusEffectShadowDrop({
      parentArtboard: this._parentArtboard,
      effects: this._effects,
      shadow: this._effects.dropShadow,
    }).convert()
  }

  private get _effectOuterGlow(): Octopus['EffectOuterGlow'] | null {
    if (this._effects.outerGlow === undefined) return null
    return new OctopusEffectGlowOuter({
      parentArtboard: this._parentArtboard,
      effects: this._effects,
      shadow: this._effects.outerGlow,
    }).convert()
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

  private get _effectSatin(): Octopus['EffectOther'] | null {
    if (this._effects.satin === undefined) return null
    return null // TODO
  }

  private get _effectInnerGlow(): Octopus['EffectInnerGlow'] | null {
    if (this._effects.innerGlow === undefined) return null
    return new OctopusEffectGlowInner({
      parentArtboard: this._parentArtboard,
      effects: this._effects,
      shadow: this._effects.innerGlow,
    }).convert()
  }

  private get _effectInnerShadow(): Octopus['EffectInnerShadow'] | null {
    if (this._effects.innerShadow === undefined) return null
    return new OctopusEffectShadowInner({
      parentArtboard: this._parentArtboard,
      effects: this._effects,
      shadow: this._effects.innerShadow,
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

  private get _effectBevelEmboss(): Octopus['EffectOther'] | null {
    if (this._effects.bevelEmboss === undefined) return null
    return null // TODO
  }

  convert(): Octopus['Effect'][] {
    const effects = [] as Octopus['Effect'][]

    const dropShadow = this._effectDropShadow
    if (dropShadow != null) effects.push(dropShadow)

    const outerGlow = this._effectOuterGlow
    if (outerGlow != null) effects.push(outerGlow)

    const overlayPattern = this._effectOverlayPattern
    if (overlayPattern != null) effects.push(overlayPattern)

    const overlayGradient = this._effectOverlayGradient
    if (overlayGradient != null) effects.push(overlayGradient)

    const overlayColor = this._effectOverlayColor
    if (overlayColor != null) effects.push(overlayColor)

    const satin = this._effectSatin
    if (satin != null) effects.push(satin)

    const innerGlow = this._effectInnerGlow
    if (innerGlow != null) effects.push(innerGlow)

    const innerShadow = this._effectInnerShadow
    if (innerShadow != null) effects.push(innerShadow)

    const stroke = this._effectStroke
    if (stroke != null) effects.push(stroke)

    const bevelEmboss = this._effectBevelEmboss
    if (bevelEmboss != null) effects.push(bevelEmboss)

    return effects
  }
}
