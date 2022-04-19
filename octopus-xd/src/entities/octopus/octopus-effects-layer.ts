import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import OctopusEffectBlur from './octopus-effect-blur'
import OctopusEffectDropShadow from './octopus-effect-drop-shadow'

import type { SourceLayer } from '../../factories/create-source-layer'
import type { Octopus } from '../../typings/octopus'
import type { RawBlur, RawEffectDropShadow } from '../../typings/source'

type OctopusEffectsLayerOptions = {
  sourceLayer: SourceLayer
}

/**
 * Primarily Raster effects (vector ones are placed on `shape` descriptor).
 */
export default class OctopusEffectsLayer {
  private _sourceLayer: SourceLayer

  constructor(options: OctopusEffectsLayerOptions) {
    this._sourceLayer = options.sourceLayer
  }

  private _hasVectorEffects(): boolean {
    return this._sourceLayer.style?.fill?.type !== 'none' || this._sourceLayer.style?.stroke?.type !== 'none'
  }

  private _convertShadows(): Octopus['EffectDropShadow'][] {
    const filters = this._sourceLayer.style?.filters
    if (!filters) return []
    return getConverted(
      asArray(filters)
        .filter((filter) => {
          return filter?.type === 'dropShadow'
        })
        .map((dropShadow) => {
          const effectsBasisMissing = !this._hasVectorEffects()
          return OctopusEffectDropShadow.fromRaw({
            effect: dropShadow as RawEffectDropShadow,
            effectsBasisMissing,
          })
        })
    )
  }

  private _convertBlurs(): Octopus['EffectBlur'][] {
    const filters = this._sourceLayer.style?.filters
    if (!filters) return []
    return getConverted(
      asArray(filters)
        .filter((filter) => {
          return filter?.type === 'uxdesign#blur'
        })
        .map((blur) => {
          return OctopusEffectBlur.fromRaw({ effect: blur as RawBlur })
        })
    )
  }

  convert(): (Octopus['EffectDropShadow'] | Octopus['EffectBlur'])[] {
    const shadows = this._convertShadows()
    const blurs = this._convertBlurs()

    return [...shadows, ...blurs]
  }
}
