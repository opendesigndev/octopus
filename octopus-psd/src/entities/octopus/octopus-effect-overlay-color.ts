import type { Octopus } from '../../typings/octopus'
import type { SourceEffectFill } from '../source/source-effect-fill'
import { logWarn } from '../../services/instances/misc'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import type { SourceColor } from '../../typings/source'
import type { OctopusLayerBase } from './octopus-layer-base'
import { OctopusEffectBase } from './octopus-effect-base'

type OctopusFillOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectFill
}

export class OctopusEffectOverlayColor extends OctopusEffectBase {
  protected _parentLayer: OctopusLayerBase
  private _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    super(options)
    this._parentLayer = options.parentLayer
    this._fill = options.effect
  }

  private get _color(): SourceColor | null {
    return this._fill.color
  }

  get overlay(): OctopusEffectFillColor | null {
    const color = this._color
    if (color === null) {
      logWarn('Unknown effect overlay color', { fill: this._fill })
      return null
    }
    const opacity = this._fill.opacity
    return new OctopusEffectFillColor({ color, opacity })
  }

  convert(): Octopus['EffectOverlay'] | null {
    const overlay = this.overlay
    if (overlay === null) return null

    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OVERLAY', visible, blendMode, basis, overlay: overlay.convert() }
  }
}
