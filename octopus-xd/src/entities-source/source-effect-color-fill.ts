import type { RawSolidFill } from '../typings/source'


export type SourceEffectColorFillOptions = {
  effect: RawSolidFill
}

export default class SourceEffectColorFill {
  private _rawEffect: RawSolidFill

  constructor(options: SourceEffectColorFillOptions) {
    this._rawEffect = options.effect
  }

  get type() {
    return this._rawEffect?.type
  }

  get color() {
    return this._rawEffect?.color
  }
}