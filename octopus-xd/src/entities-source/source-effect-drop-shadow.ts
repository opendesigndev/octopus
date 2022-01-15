import type { RawEffectDropShadow } from '../typings/source'


export type SourceEffectDropShadowOptions = {
  effect: RawEffectDropShadow
}

export default class SourceEffectDropShadow {
  private _rawEffect: RawEffectDropShadow

  constructor(options: SourceEffectDropShadowOptions) {
    this._rawEffect = options.effect
  }

  get visible() {
    return this._rawEffect?.visible
  }

  get dropShadowParams() {
    return this._rawEffect?.params?.dropShadows?.[0]
  }
}