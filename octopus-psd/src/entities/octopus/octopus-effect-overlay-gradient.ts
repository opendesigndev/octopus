import type { Octopus } from '../../typings/octopus'
import type { SourceEffectFill } from '../source/source-effect-fill'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'
import type { OctopusLayerBase } from './octopus-layer-base'
import { OctopusEffectBase } from './octopus-effect-base'

type OctopusFillOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectFill
}

export class OctopusEffectOverlayGradient extends OctopusEffectBase {
  protected _parentLayer: OctopusLayerBase
  private _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    super(options)
    this._parentLayer = options.parentLayer
    this._fill = options.effect
  }

  get overlay(): OctopusEffectFillGradient {
    const parentLayer = this._parentLayer
    const fill = this._fill
    return new OctopusEffectFillGradient({ parentLayer, fill })
  }

  convert(): Octopus['EffectOverlay'] | null {
    const overlay = this.overlay.convert()
    if (overlay === null) return null

    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OVERLAY', visible, blendMode, basis, overlay }
  }
}
