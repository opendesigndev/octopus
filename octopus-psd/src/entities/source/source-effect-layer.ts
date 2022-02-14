import type { RawLayerEffect } from '../../typings/raw'

export class SourceLayerEffect {
  protected _rawValue: RawLayerEffect | undefined

  constructor(effect: RawLayerEffect | undefined) {
    this._rawValue = effect
  }

  // TODO remove in the end
  get RAW() {
    return this._rawValue
  }
}
