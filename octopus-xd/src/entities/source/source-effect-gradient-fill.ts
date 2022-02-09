import type { RawFillGradient } from '../../typings/source'


export type SourceEffectFillGradientOptions = {
  effect: RawFillGradient
}

export default class SourceEffectFillGradient {
  private _rawEffect: RawFillGradient

  constructor(options: SourceEffectFillGradientOptions) {
    this._rawEffect = options.effect
  }

  get ref() {
    return this._rawEffect?.gradient?.ref
  }

  get gradientResources() {
    return this._rawEffect?.gradient?.meta?.ux?.gradientResources
  }

  get type() {
    return this._rawEffect?.type
  }

  get gradient() {
    return this._rawEffect?.gradient
  }
}