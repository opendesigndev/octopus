import type { RawGradientFill } from '../typings/source'


export type SourceEffectGradientFillOptions = {
  effect: RawGradientFill
}

export default class SourceEffectGradientFill {
  private _rawEffect: RawGradientFill

  constructor(options: SourceEffectGradientFillOptions) {
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