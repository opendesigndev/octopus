import type { Defined } from '../../typings/helpers.js'
import type { RawFillGradient } from '../../typings/source/index.js'

export type SourceEffectFillGradientOptions = {
  effect: RawFillGradient
}

export class SourceEffectFillGradient {
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
