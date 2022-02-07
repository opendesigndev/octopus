import type { RawSolidFill } from '../../typings/source'


export type SourceEffectFillColorOptions = {
  effect: RawSolidFill
}

export default class SourceEffectFillColor {
  private _rawEffect: RawSolidFill

  constructor(options: SourceEffectFillColorOptions) {
    this._rawEffect = options.effect
  }

  get type() {
    return this._rawEffect?.type
  }

  get color() {
    return this._rawEffect?.color
  }
}