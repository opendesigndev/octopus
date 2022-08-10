import { logWarn } from '../../services/instances/misc.js'
import { convertBlendMode, convertColor } from '../../utils/convert.js'

import type { Octopus } from '../../typings/octopus.js'
import type { SourceEffect } from '../source/source-effect.js'

export class OctopusEffect {
  private _effect: SourceEffect

  constructor(effect: SourceEffect) {
    this._effect = effect
  }

  get visible(): boolean {
    return this._effect.visible
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._effect.blendMode)
  }

  get shadow(): Octopus['ShadowConfig'] | null {
    const offset = this._effect.offset
    if (offset === null) return null

    const blur = this._effect.radius
    const choke = this._effect.spread
    const color = convertColor(this._effect.color)

    return { offset, blur, choke, color }
  }

  private get _innerShadow(): Octopus['EffectInnerShadow'] | null {
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'BODY'
    const shadow = this.shadow
    if (shadow === null) return null

    return { type: 'INNER_SHADOW', visible, blendMode, basis, shadow }
  }

  private get _dropShadow(): Octopus['EffectDropShadow'] | null {
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'BODY'
    const shadow = this.shadow
    if (shadow === null) return null

    return { type: 'DROP_SHADOW', visible, blendMode, basis, shadow }
  }

  private get _blur(): Octopus['EffectBlur'] {
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'LAYER_AND_EFFECTS'
    const blur = this._effect.radius / 2

    return { type: 'BLUR', visible, blendMode, basis, blur }
  }

  private get _backgroundBlur(): Octopus['EffectBlur'] {
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'BACKGROUND'
    const blur = this._effect.radius

    return { type: 'BLUR', visible, blendMode, basis, blur }
  }

  convert(): Octopus['Effect'] | null {
    const type = this._effect.type
    switch (type) {
      case 'INNER_SHADOW':
        return this._innerShadow
      case 'DROP_SHADOW':
        return this._dropShadow
      case 'LAYER_BLUR':
        return this._blur
      case 'BACKGROUND_BLUR':
        return this._backgroundBlur
      default:
        logWarn('Unknown Effect type', { type })
        return null
    }
  }
}
