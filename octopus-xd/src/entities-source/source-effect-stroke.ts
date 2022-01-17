import type { RawStroke } from '../typings/source'


export type SourceEffectStrokeOptions = {
  effect: RawStroke
}

export default class SourceEffectStroke {
  private _rawEffect: RawStroke

  constructor(options: SourceEffectStrokeOptions) {
    this._rawEffect = options.effect
  }

  get type() {
    return this._rawEffect?.type
  }

  get dash() {
    return this._rawEffect?.dash
  }

  get join() {
    return this._rawEffect?.join
  }

  get cap() {
    return this._rawEffect?.cap
  }

  get align() {
    return this._rawEffect?.align
  }

  get width() {
    return this._rawEffect?.width
  }

  get color() {
    return this._rawEffect?.color
  }
}