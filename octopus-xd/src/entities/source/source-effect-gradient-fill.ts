import type { Defined } from '../../typings/helpers'
import type { RawFillGradient } from '../../typings/source'

export type SourceEffectFillGradientOptions = {
  effect: RawFillGradient
}

export default class SourceEffectFillGradient {
  private _rawEffect: RawFillGradient

  constructor(options: SourceEffectFillGradientOptions) {
    this._rawEffect = options.effect
  }

  get ref(): Defined<RawFillGradient['gradient']>['ref'] {
    return this._rawEffect?.gradient?.ref
  }

  get gradientResources(): Defined<Defined<Defined<RawFillGradient['gradient']>['meta']>['ux']>['gradientResources'] {
    return this._rawEffect?.gradient?.meta?.ux?.gradientResources
  }

  get type(): RawFillGradient['type'] {
    return this._rawEffect?.type
  }

  get gradient(): RawFillGradient['gradient'] {
    return this._rawEffect?.gradient
  }
}
