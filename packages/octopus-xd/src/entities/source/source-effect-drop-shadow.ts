import type { RawEffectDropShadow } from '../../typings/source'
import type { ElementOf } from '@opendesign/octopus-common/utility-types'

export type SourceEffectDropShadowOptions = {
  effect: RawEffectDropShadow
}

export class SourceEffectDropShadow {
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
