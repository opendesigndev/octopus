import defaults from '../utils/defaults'
import { asString } from '../utils/as'
import SourceEffectImageFill from '../entities-source/source-effect-image-fill'

import type { Octopus } from '../typings/octopus'
import type { SourceEffectImageFillOptions } from '../entities-source/source-effect-image-fill'


type OctopusEffectImageFillOptions = {
  source: SourceEffectImageFill
}

export default class OctopusEffectImageFill {
  private _source: SourceEffectImageFill

  static fromRaw(options: SourceEffectImageFillOptions) {
    return new this({
      source: new SourceEffectImageFill(options)
    })
  }

  constructor(options: OctopusEffectImageFillOptions) {
    this._source = options.source
  }

  convert(): Octopus['Fill'] | null {
    const visible = this._source.type !== 'none'

    const ref = {
      type: 'RESOURCE',
      value: asString(this._source.uid)
    } as const

    const scaleBehaviors = {
      cover: 'FILL',
      fill: 'STRETCH'
    } as const

    const scaleBehavior = this._source.scaleBehavior

    const fillType = scaleBehavior
      ? scaleBehaviors[scaleBehavior]
      : defaults.EFFECTS.IMAGE_FILL_TYPE

    return {
      type: 'IMAGE' as const,
      visible,
      blendMode: defaults.BLEND_MODE,
      image: {
        ref
      },
      positioning: {
        layout: fillType,
        origin: 'LAYER',
        transform: [1, 0, 0, 1, 0, 0] /** @TODO set optionally */
      }
    }
  }
}