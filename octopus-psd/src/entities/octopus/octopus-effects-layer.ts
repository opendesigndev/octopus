import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { Octopus } from '../../typings/octopus'
import { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusEffectBevelEmboss } from './octopus-effect-bevel-emboss'
import { OctopusEffectGlowInner } from './octopus-effect-glow-inner'
import { OctopusEffectGlowOuter } from './octopus-effect-glow-outer'
import { OctopusEffectOverlayColor } from './octopus-effect-overlay-color'
import { OctopusEffectOverlayGradient } from './octopus-effect-overlay-gradient'
import { OctopusEffectOverlayPattern } from './octopus-effect-overlay-pattern'
import { OctopusEffectSatin } from './octopus-effect-satin'
import { OctopusEffectShadowDrop } from './octopus-effect-shadow-drop'
import { OctopusEffectShadowInner } from './octopus-effect-shadow-inner'
import { OctopusEffectStroke } from './octopus-effect-stroke'
import { OctopusLayerBase } from './octopus-layer-base'

type OctopusEffectLayerOptions = {
  parentLayer: OctopusLayerBase
}

export class OctopusEffectsLayer {
  private _parentLayer: OctopusLayerBase

  constructor(options: OctopusEffectLayerOptions) {
    this._parentLayer = options.parentLayer
  }

  private get _effects(): SourceLayerEffects {
    return this._parentLayer.sourceLayer.layerEffects
  }

  @firstCallMemo()
  private get _effectDropShadow(): Octopus['EffectDropShadow'] | null {
    if (this._effects.dropShadow === undefined) return null
    return new OctopusEffectShadowDrop({
      parentLayer: this._parentLayer,
      effect: this._effects.dropShadow,
    }).convert()
  }

  @firstCallMemo()
  private get _effectOuterGlow(): Octopus['EffectOuterGlow'] | null {
    if (this._effects.outerGlow === undefined) return null
    return new OctopusEffectGlowOuter({
      parentLayer: this._parentLayer,
      effect: this._effects.outerGlow,
    }).convert()
  }

  @firstCallMemo()
  private get _effectOverlayPattern(): Octopus['EffectOverlay'] | null {
    if (this._effects.patternFill === undefined) return null
    return new OctopusEffectOverlayPattern({
      parentLayer: this._parentLayer,
      effect: this._effects.patternFill,
    }).convert()
  }

  @firstCallMemo()
  private get _effectOverlayGradient(): Octopus['EffectOverlay'] | null {
    if (this._effects.gradientFill === undefined) return null
    return new OctopusEffectOverlayGradient({
      parentLayer: this._parentLayer,
      effect: this._effects.gradientFill,
    }).convert()
  }

  @firstCallMemo()
  private get _effectOverlayColor(): Octopus['EffectOverlay'] | null {
    if (this._effects.solidFill === undefined) return null
    return new OctopusEffectOverlayColor({
      parentLayer: this._parentLayer,
      effect: this._effects.solidFill,
    }).convert()
  }

  @firstCallMemo()
  private get _effectSatin(): Octopus['EffectOther'] | null {
    if (this._effects.satin === undefined) return null
    return new OctopusEffectSatin({
      parentLayer: this._parentLayer,
      effect: this._effects.satin,
    }).convert()
  }

  @firstCallMemo()
  private get _effectInnerGlow(): Octopus['EffectInnerGlow'] | null {
    if (this._effects.innerGlow === undefined) return null
    return new OctopusEffectGlowInner({
      parentLayer: this._parentLayer,
      effect: this._effects.innerGlow,
    }).convert()
  }

  @firstCallMemo()
  private get _effectInnerShadow(): Octopus['EffectInnerShadow'] | null {
    if (this._effects.innerShadow === undefined) return null
    return new OctopusEffectShadowInner({
      parentLayer: this._parentLayer,
      effect: this._effects.innerShadow,
    }).convert()
  }

  @firstCallMemo()
  private get _effectStroke(): Octopus['EffectStroke'] | null {
    if (this._effects.stroke === undefined) return null
    return new OctopusEffectStroke({
      parentLayer: this._parentLayer,
      effect: this._effects.stroke,
    }).convert()
  }

  @firstCallMemo()
  private get _effectBevelEmboss(): Octopus['EffectOther'] | null {
    if (this._effects.bevelEmboss === undefined) return null
    return new OctopusEffectBevelEmboss({
      parentLayer: this._parentLayer,
      effect: this._effects.bevelEmboss,
    }).convert()
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
