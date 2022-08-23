import type { RawStroke } from '../../typings/source'

export type SourceEffectStrokeOptions = {
  effect: RawStroke
}

export class SourceEffectStroke {
  private _rawEffect: RawStroke

  constructor(options: SourceEffectStrokeOptions) {
    this._rawEffect = options.effect
  }

  get type(): RawStroke['type'] {
    return this._rawEffect?.type
  }

  get dash(): RawStroke['dash'] {
    return this._rawEffect?.dash
  }

  get join(): RawStroke['join'] {
    return this._rawEffect?.join
  }

  get cap(): RawStroke['cap'] {
    return this._rawEffect?.cap
  }

  get align(): RawStroke['align'] {
    return this._rawEffect?.align
  }

  get width(): RawStroke['width'] {
    return this._rawEffect?.width
  }

  get color(): RawStroke['color'] {
    return this._rawEffect?.color
  }
}
