import type { Octopus } from '../../typings/octopus'
import type { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { convertBlendMode, convertColor } from '../../utils/convert'
import type { SourceColor } from '../../typings/source'
import { SourceEffectShadow } from '../source/source-effect-shadow'

type OctopusGlowOptions = {
  parentArtboard: OctopusArtboard
  effects: SourceLayerEffects
  shadow: SourceEffectShadow
}

export class OctopusEffectGlowOuter {
  protected _parentArtboard: OctopusArtboard
  protected _effects: SourceLayerEffects
  protected _shadow: SourceEffectShadow

  constructor(options: OctopusGlowOptions) {
    this._parentArtboard = options.parentArtboard
    this._effects = options.effects
    this._shadow = options.shadow
  }

  get color(): SourceColor | null {
    return this._shadow.color
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._shadow?.blendMode)
  }

  get visible(): boolean {
    const enabled = this._shadow?.enabled ?? false
    const enabledAll = this._effects.enabledAll ?? false
    return enabledAll && enabled
  }

  convert(): Octopus['EffectOuterGlow'] | null {
    const color = convertColor(this._shadow.color, this._shadow.opacity)
    const blur = this._shadow.blur
    const choke = this._shadow.choke
    const offset = { x: 10, y: 10 } // TODO
    const glow = { color, blur, choke, offset }

    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OUTER_GLOW', glow, visible, blendMode, basis }
  }
}
