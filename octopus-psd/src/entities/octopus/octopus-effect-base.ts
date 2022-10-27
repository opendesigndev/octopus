import { convertBlendMode } from '../../utils/convert'

import type { DesignConverter } from '../../services/conversion/design-converter'
import type { Octopus } from '../../typings/octopus'
import type { SourceEffectBase } from '../source/source-effect-base'
import type { SourceLayerEffects } from '../source/source-effects-layer'
import type { OctopusLayerBase } from './octopus-layer-base'

type OctopusEffectBaseOptions = {
  parentLayer: OctopusLayerBase
  effect: SourceEffectBase
}

export class OctopusEffectBase {
  protected _parentLayer: OctopusLayerBase
  protected _effect: SourceEffectBase

  constructor(options: OctopusEffectBaseOptions) {
    this._parentLayer = options.parentLayer
    this._effect = options.effect
  }

  protected get _effects(): SourceLayerEffects {
    return this._parentLayer.sourceLayer.layerEffects
  }

  protected get _designConverter(): DesignConverter {
    return this._parentLayer.parentComponent.designConverter
  }

  get blendMode(): Octopus['BlendMode'] {
    return convertBlendMode(this._effect?.blendMode)
  }

  get visible(): boolean {
    const enabled = this._effect?.enabled ?? false
    const enabledAll = this._effects.enabledAll ?? false
    return enabledAll && enabled
  }
}
