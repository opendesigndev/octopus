import OctopusBounds from '../octopus/octopus-bounds'

import type { Defined } from '../../typings/helpers'
import type { RawFillImage } from '../../typings/source'

/** Just a helper type to shorten long types on methods */
type DefinedPattern = Defined<RawFillImage['pattern']>
type DefinedUx = Defined<Defined<DefinedPattern['meta']>['ux']>

export type SourceEffectFillImageOptions = {
  effect: RawFillImage
  effectBounds: OctopusBounds
}

export default class SourceEffectFillImage {
  private _rawEffect: RawFillImage

  constructor(options: SourceEffectFillImageOptions) {
    this._rawEffect = options.effect
  }

  get type(): RawFillImage['type'] {
    return this._rawEffect?.type
  }

  get uid(): DefinedUx['uid'] {
    return this._rawEffect?.pattern?.meta?.ux?.uid
  }

  get scaleBehavior(): DefinedUx['scaleBehavior'] {
    return this._rawEffect?.pattern?.meta?.ux?.scaleBehavior
  }

  get scale(): DefinedUx['scale'] {
    return this._rawEffect?.pattern?.meta?.ux?.scale
  }

  get scaleX(): DefinedUx['scaleX'] {
    return this._rawEffect?.pattern?.meta?.ux?.scaleX
  }

  get scaleY(): DefinedUx['scaleY'] {
    return this._rawEffect?.pattern?.meta?.ux?.scaleY
  }

  get offsetX(): DefinedUx['offsetX'] {
    return this._rawEffect?.pattern?.meta?.ux?.offsetX
  }

  get offsetY(): DefinedUx['offsetY'] {
    return this._rawEffect?.pattern?.meta?.ux?.offsetY
  }

  get flipX(): DefinedUx['flipX'] {
    return this._rawEffect?.pattern?.meta?.ux?.flipX
  }

  get flipY(): DefinedUx['flipY'] {
    return this._rawEffect?.pattern?.meta?.ux?.flipY
  }

  get imageWidth(): DefinedPattern['width'] {
    return this._rawEffect?.pattern?.width
  }

  get imageHeight(): DefinedPattern['height'] {
    return this._rawEffect?.pattern?.height
  }
}
