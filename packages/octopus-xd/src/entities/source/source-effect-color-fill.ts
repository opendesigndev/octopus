import type { RawFillColor } from '../../typings/source/index.js'

export type SourceEffectFillColorOptions = {
  effect: RawFillColor
}

export class SourceEffectFillColor {
  private _rawEffect: RawFillColor

  constructor(options: SourceEffectFillColorOptions) {
    this._rawEffect = options.effect
  }

  get type(): RawFillColor['type'] {
    return this._rawEffect?.type
  }

  get color(): RawFillColor['color'] {
    return this._rawEffect?.color
  }
}
