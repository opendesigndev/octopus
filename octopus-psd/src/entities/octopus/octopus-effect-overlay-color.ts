import type { Octopus } from '../../typings/octopus'
import type { SourceEffectFill } from '../source/source-effect-fill'
import type { SourceLayerEffects } from '../source/source-effects-layer'
import { logWarn } from '../../services/instances/misc'
import { convertBlendMode } from '../../utils/convert'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import type { SourceColor } from '../../typings/source'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusFillOptions = {
  parentLayer: OctopusLayerBase
  fill: SourceEffectFill
}

export class OctopusEffectOverlayColor {
  private _parentLayer: OctopusLayerBase
  private _fill: SourceEffectFill

  constructor(options: OctopusFillOptions) {
    this._parentLayer = options.parentLayer
    this._fill = options.fill
  }

  private get _effects(): SourceLayerEffects {
    return this._parentLayer.sourceLayer.layerEffects
  }

  private get _color(): SourceColor | null {
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
