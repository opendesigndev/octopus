import { clamp, cos, round, sin } from '@opendesign/octopus-common/dist/utils/math.js'

import { convertColor } from '../../utils/convert.js'
import { OctopusEffectBase } from './octopus-effect-base.js'

import type { Octopus } from '../../typings/octopus'
import type { SourceEffectShadow } from '../source/source-effect-shadow'
import type { OctopusComponent } from './octopus-component'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusShadowCommonOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectShadow
}

export class OctopusEffectShadowCommon extends OctopusEffectBase {
  protected _parentLayer: OctopusLayerBase
  private _shadow: SourceEffectShadow

  constructor(options: OctopusShadowCommonOptions) {
    super(options)
    this._parentLayer = options.parentLayer
    this._shadow = options.effect
  }

  private get _parentComponent(): OctopusComponent {
    return this._parentLayer.parentComponent
  }

  /**
   * When there is a shadow with 1px blur, PS displays 1px line with
   * half the opacity, while chrome just rounds it down and displays nothing.
   * Therefore we replace <= 1px shadows with blur=0; choke=1
   * and modified opacity to simulate PS rendering.
   */
  private get _is1pxBlur(): boolean {
    const { distance, blur, choke } = this._shadow
    return distance < 1 && blur >= 1 && choke + blur < 1.0005
  }

  private get _choke(): number {
    const { blur, choke } = this._shadow
    return this._is1pxBlur ? 1 : round((blur * choke) / 100, 1)
  }

  private get _blur(): number {
    const { blur, choke } = this._shadow
    return this._is1pxBlur ? 0 : round(blur - (blur * choke) / 100, 1)
  }

  private get _color(): Octopus['Color'] {
    const opacity = this._is1pxBlur ? clamp(this._shadow.choke, 0.5, 1) : this._shadow.opacity
    return convertColor(this._shadow.color, opacity)
  }

  private get _offset(): Octopus['Vec2'] {
    const angle = this._shadow.useGlobalAngle
      ? this._parentComponent.sourceComponent.globalLightAngle
      : this._shadow.localLightingAngle
    const distance = this._shadow.distance

    const x = -round(distance * cos(angle), 1)
    const y = round(distance * sin(angle), 1)

    return { x, y }
  }

  get shadowConfig(): Octopus['ShadowConfig'] {
    const color = this._color
    const blur = this._blur
    const choke = this._choke
    const offset = this._offset

    return { color, blur, choke, offset }
  }
}
