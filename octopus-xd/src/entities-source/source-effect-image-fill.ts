import type { RawImageFill } from '../typings/source'


export type SourceEffectImageFillOptions = {
  effect: RawImageFill
}

export default class SourceEffectImageFill {
  private _rawEffect: RawImageFill

  constructor(options: SourceEffectImageFillOptions) {
    this._rawEffect = options.effect
  }

  get type() {
    return this._rawEffect?.type
  }

  get uid() {
    return this._rawEffect?.pattern?.meta?.ux?.uid
  }

  get scaleBehavior() {
    return this._rawEffect?.pattern?.meta?.ux?.scaleBehavior
  }
}