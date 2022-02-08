import type { RawBlur } from '../../typings/source'


export type SourceEffectBlurOptions = {
  effect: RawBlur
}

export default class SourceEffectBlur {
  private _rawEffect: RawBlur

  constructor(options: SourceEffectBlurOptions) {
    this._rawEffect = options.effect
  }

  get visible() {
    return this._rawEffect?.visible
  }

  get blur() {
    return this._rawEffect?.params?.blurAmount
  }

  get brightness() {
    return this._rawEffect?.params?.brightnessAmount
  }

  get opacity() {
    return this._rawEffect?.params?.fillOpacity
  }

  get backgroundEffect() {
    return this._rawEffect?.params?.backgroundEffect
  }
}