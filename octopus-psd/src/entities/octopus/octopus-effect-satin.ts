import type { Octopus } from '../../typings/octopus'
import type { SourceEffectSatin } from '../source/source-effect-satin'
import { SourceLayerEffects } from '../source/source-effects-layer'
import type { OctopusLayerBase } from './octopus-layer-base'
import { convertBlendMode, convertColor } from '../../utils/convert'

type OctopusEffectSatinOptions = {
  parentLayer: OctopusLayerBase
  satin: SourceEffectSatin
}

export class OctopusEffectSatin {
  private _parentLayer: OctopusLayerBase
  private _satin: SourceEffectSatin

  constructor(options: OctopusEffectSatinOptions) {
    this._parentLayer = options.parentLayer
    this._satin = options.satin
  }

  private get _effects(): SourceLayerEffects {
    return this._parentLayer.sourceLayer.layerEffects
  }

  private get _color(): Octopus['Color'] | null {
    const color = this._satin.color
    const opacity = this._satin.opacity
    return convertColor(color, opacity)
  }

  private get _otherEffectProperties() {
    const color = this._color
    const blur = this._satin.blur
    const distance = this._satin.distance
    const angle = this._satin.localLightingAngle
    const invert = this._satin.invert
    return { otherEffectType: 'SATIN', color, blur, distance, angle, invert }
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._satin?.blendMode)
  }

  get visible(): boolean {
    const enabled = this._satin?.enabled ?? false
    const enabledAll = this._effects.enabledAll ?? false
    return enabledAll && enabled
  }

  convert(): Octopus['EffectOther'] | null {
    const otherEffectProperties = this._otherEffectProperties
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OTHER', visible, blendMode, basis, otherEffectProperties }
  }
}
