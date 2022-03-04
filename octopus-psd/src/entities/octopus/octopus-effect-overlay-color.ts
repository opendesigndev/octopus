import type { Octopus } from '../../typings/octopus'
import type { SourceEffectFill } from '../source/source-effect-fill'
import type { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { logWarn } from '../../services/instances/misc'
import { convertBlendMode } from '../../utils/convert'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import type { SourceColor } from '../../typings/source'

type OctopusFillOptions = {
  parentArtboard: OctopusArtboard
  effects: SourceLayerEffects
  fill: SourceEffectFill
}

export class OctopusEffectOverlayColor {
  protected _parentArtboard: OctopusArtboard
  protected _effects: SourceLayerEffects
  protected _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    this._parentArtboard = options.parentArtboard
    this._effects = options.effects
    this._fill = options.fill
  }

  get color(): SourceColor | null {
    return this._fill.color
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._fill?.blendMode)
  }

  get visible(): boolean {
    const enabled = this._fill?.enabled ?? false
    const enabledAll = this._effects.enabledAll ?? false
    return enabledAll && enabled
  }

  convert(): Octopus['EffectOverlay'] | null {
    const color = this.color
    if (color === null) {
      logWarn('Unknown effect overlay color', { fill: this._fill })
      return null
    }
    const opacity = this._fill.opacity
    const overlay = new OctopusEffectFillColor({ color, opacity }).convert()

    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OVERLAY', visible, blendMode, basis, overlay }
  }
}
