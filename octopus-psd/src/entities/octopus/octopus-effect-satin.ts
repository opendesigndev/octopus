import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/convert'
import type { SourceEffectSatin } from '../source/source-effect-satin'
import { OctopusEffectBase } from './octopus-effect-base'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusEffectSatinOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectSatin
}

export class OctopusEffectSatin extends OctopusEffectBase {
  protected _parentLayer: OctopusLayerBase
  private _satin: SourceEffectSatin

  constructor(options: OctopusEffectSatinOptions) {
    super(options)
    this._parentLayer = options.parentLayer
    this._satin = options.effect
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

  convert(): Octopus['EffectOther'] | null {
    const otherEffectProperties = this._otherEffectProperties
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OTHER', visible, blendMode, basis, otherEffectProperties }
  }
}
