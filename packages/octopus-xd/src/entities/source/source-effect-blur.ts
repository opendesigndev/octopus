import type { RawBlur } from '../../typings/source'

export type SourceEffectBlurOptions = {
  effect: RawBlur
}

export class SourceEffectBlur {
  private _rawEffect: RawBlur

  constructor(options: SourceEffectBlurOptions) {
    this._rawEffect = options.effect
  }

  get visible(): RawBlur['visible'] {
    return this._rawEffect?.visible
  }

  get blur(): Exclude<RawBlur['params'], undefined>['blurAmount'] {
    return this._rawEffect?.params?.blurAmount
  }

  get brightness(): Exclude<RawBlur['params'], undefined>['brightnessAmount'] {
    return this._rawEffect?.params?.brightnessAmount
  }

  get opacity(): Exclude<RawBlur['params'], undefined>['fillOpacity'] {
    return this._rawEffect?.params?.fillOpacity
  }

  get backgroundEffect(): Exclude<RawBlur['params'], undefined>['backgroundEffect'] {
    return this._rawEffect?.params?.backgroundEffect
  }
}
