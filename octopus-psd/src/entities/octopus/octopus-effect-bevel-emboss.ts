import type { Octopus } from '../../typings/octopus'
import type { SourceEffectBevelEmboss } from '../source/source-effect-bevel-emboss'
import { SourceLayerEffects } from '../source/source-effects-layer'
import type { OctopusLayerBase } from './octopus-layer-base'
import { convertBlendMode } from '../../utils/convert'

type OctopusEffectBevelEmbossOptions = {
  parentLayer: OctopusLayerBase
  bevelEmboss: SourceEffectBevelEmboss
}

export class OctopusEffectBevelEmboss {
  private _parentLayer: OctopusLayerBase
  private _bevelEmboss: SourceEffectBevelEmboss

  constructor(options: OctopusEffectBevelEmbossOptions) {
    this._parentLayer = options.parentLayer
    this._bevelEmboss = options.bevelEmboss
  }

  private get _effects(): SourceLayerEffects {
    return this._parentLayer.sourceLayer.layerEffects
  }

  private get otherEffectProperties() {
    return { otherEffectType: 'BEVEL_AND_EMBOSS' }
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._bevelEmboss?.highlightMode)
  }

  get visible(): boolean {
    const enabled = this._bevelEmboss?.enabled ?? false
    const enabledAll = this._effects.enabledAll ?? false
    return enabledAll && enabled
  }

  convert(): Octopus['EffectOther'] | null {
    const otherEffectProperties = this.otherEffectProperties
    const visible = this.visible
    const blendMode = this.blendMode
    const basis = 'FILL'
    return { type: 'OTHER', visible, blendMode, basis, otherEffectProperties }
  }
}
