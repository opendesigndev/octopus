import type { Octopus } from '../../typings/octopus'
import type { SourceEffectFill } from '../source/source-effect-fill'
import type { SourceLayerEffects } from '../source/source-effects-layer'
import { OctopusArtboard } from './octopus-artboard'
import { convertBlendMode } from '../../utils/convert'
import type { SourceBounds } from '../../typings/source'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'

type OctopusFillOptions = {
  parentArtboard: OctopusArtboard
  sourceLayerBounds: SourceBounds
  effects: SourceLayerEffects
  fill: SourceEffectFill
}

export class OctopusEffectOverlayGradient {
  protected _parentArtboard: OctopusArtboard
  protected _effects: SourceLayerEffects
  protected _fill: SourceEffectFill
  protected _sourceLayerBounds: SourceBounds

  constructor(options: OctopusFillOptions) {
    this._parentArtboard = options.parentArtboard
    this._effects = options.effects
    this._fill = options.fill
    this._sourceLayerBounds = options.sourceLayerBounds
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
    const parentArtboard = this._parentArtboard
    const sourceLayerBounds = this._sourceLayerBounds
    const fill = this._fill
    const overlay = new OctopusEffectFillGradient({ parentArtboard, sourceLayerBounds, fill }).convert()
    if (overlay === null) return null

    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OVERLAY', visible, blendMode, basis, overlay }
  }
}
