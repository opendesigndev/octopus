import defaults from '../utils/defaults'

import { asString } from '../utils/as'

import type { RawImageFill } from '../typings/source'
import type { Octopus } from '../typings/octopus'


type OctopusEffectImageFillOptions = {
  effect: RawImageFill
}

export default class OctopusEffectImageFill {
  _rawEffect: RawImageFill

  constructor(options: OctopusEffectImageFillOptions) {
    this._rawEffect = options.effect
  }

  convert(): Octopus['EffectImageFill'] | null {
    const visible = this._rawEffect?.type !== 'none'

    /** @TODO discuss location descriptor */
    const ref = {
      type: 'RESOURCE',
      value: asString(this._rawEffect?.pattern?.meta?.ux?.uid)
    } as const

    const scaleBehaviors = {
      cover: 'FILL',
      fill: 'STRETCH'
    } as const

    const scaleBehavior = this._rawEffect?.pattern?.meta?.ux?.scaleBehavior

    const fillType = scaleBehavior
      ? scaleBehaviors[scaleBehavior]
      : defaults.EFFECTS.IMAGE_FILL_TYPE

    return {
      type: 'IMAGE_FILL' as const,
      visible,
      blendMode: defaults.BLEND_MODE,
      image: {
        ref,
        // premultiplied: ,
        // subsection: 
      },
      positioning: {
        layout: fillType,
        origin: 'LAYER',
        transform: [1, 2, 3, 4, 5, 6] /** @TODO set optionally */
      }
    }
  }
}