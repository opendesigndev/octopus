import type { RawEffectDropShadow } from '../../typings/source'

/** @TODO remove after merge with newest octopus-common */
export type ElementOf<T> = T extends Array<infer U> ? U : never

export type SourceEffectDropShadowOptions = {
  effect: RawEffectDropShadow
}

export default class SourceEffectDropShadow {
  private _rawEffect: RawEffectDropShadow

  constructor(options: SourceEffectDropShadowOptions) {
    this._rawEffect = options.effect
  }

  get visible(): RawEffectDropShadow['visible'] {
    return this._rawEffect?.visible
  }

  get dropShadowParams(): ElementOf<Exclude<RawEffectDropShadow['params'], undefined>['dropShadows']> | undefined {
    return this._rawEffect?.params?.dropShadows?.[0]
  }
}
