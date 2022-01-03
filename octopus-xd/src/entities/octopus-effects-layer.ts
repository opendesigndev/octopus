import { SourceLayer } from '../factories/create-source-layer'
import { Octopus } from '../typings/octopus'
import { RawBlur, RawEffectDropShadow } from '../typings/source'
import { asArray } from '../utils/as'
import OctopusEffectBlur from './octopus-effect-blur'
import OctopusEffectDropShadow from './octopus-effect-drop-shadow'



type OctopusEffectsLayerOptions = {
  sourceLayer: SourceLayer
}

/**
 * Primarily Raster effects (vector ones are placed on `shape` descriptor).
 */
export default class OctopusEffectsLayer {
  _sourceLayer: SourceLayer

  constructor(options: OctopusEffectsLayerOptions) {
    this._sourceLayer = options.sourceLayer
  }

  _convertShadows(): Octopus['EffectDropShadow'][] {
    const filters = this._sourceLayer.style?.filters
    if (!filters) return []
    return asArray(filters).filter(filter => {
      return filter?.type === 'dropShadow'
    }).map(dropShadow => {
      return new OctopusEffectDropShadow({ effect: dropShadow as RawEffectDropShadow }).convert()
    }).filter((converted: Octopus['EffectDropShadow'] | null) => {
      return converted
    }) as Octopus['EffectDropShadow'][]
  }

  /**
   * @TODO guard returned value with types
   */
  _convertBlurs() {
    const filters = this._sourceLayer.style?.filters
    if (!filters) return []
    return asArray(filters).filter(filter => {
      return filter?.type === 'uxdesign#blur'
    }).map(blur => {
      return new OctopusEffectBlur({ effect: blur as RawBlur }).convert()
    }).filter((converted) => {
      return converted
    })
  }

  convert() {
    /** @TODO is ordering really important when it comes from object's props instead of array? */
    const shadows = this._convertShadows()
    const blurs = this._convertBlurs()

    return [
      ...shadows,
      ...blurs
    ]
  }
}