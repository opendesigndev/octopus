import type { Octopus } from '../../typings/octopus'
import type { SourceLayerEffect } from '../source/source-effect-layer'

type OctopusFillOptions = {
  effect: SourceLayerEffect
}

export class OctopusEffectOverlay {
  protected _effect: SourceLayerEffect

  constructor(options: OctopusFillOptions) {
    this._effect = options.effect
  }

  convert(): Octopus['EffectOverlay'] | null {
    // const overlay =  new OctopusEffectFill()
    const overlay = {} as Octopus['EffectOverlay']['overlay']
    const visible = true // TODO
    const blendMode = 'NORMAL' // TODO
    const basis = 'BODY_PLUS_STROKES' // TODO
    return { type: 'OVERLAY', visible, blendMode, basis, overlay }
  }
}
