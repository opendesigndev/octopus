import { asArray } from '../utils/as'
import OctopusEffectBlur from './octopus-effect-blur'
import OctopusEffectDropShadow from './octopus-effect-drop-shadow'

import type { SourceLayer } from '../factories/create-source-layer'
import type { Octopus } from '../typings/octopus'
import type { RawBlur, RawEffectDropShadow } from '../typings/source'
import { getConverted } from '../utils/common'


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

  private _convertShadows(): Octopus['EffectDropShadow'][] {
    const filters = this._sourceLayer.style?.filters
    if (!filters) return []
    return getConverted(asArray(filters).filter(filter => {
      return filter?.type === 'dropShadow'
    }).map(dropShadow => {
      return OctopusEffectDropShadow.fromRaw({
        effect: dropShadow as RawEffectDropShadow
      })
    }))
  }

  /** @TODO do we still need EffectBackgroundBlur if we already have `basis`? */
  private _convertBlurs(): Octopus['EffectBlur'][] {
    const filters = this._sourceLayer.style?.filters
    if (!filters) return []
    return getConverted(asArray(filters).filter(filter => {
      return filter?.type === 'uxdesign#blur'
    }).map(blur => {
      return OctopusEffectBlur.fromRaw({ effect: blur as RawBlur })
    }))
  }

  convert() {
    const shadows = this._convertShadows()
    const blurs = this._convertBlurs()

    return [
      ...shadows,
      ...blurs
    ]
  }
}