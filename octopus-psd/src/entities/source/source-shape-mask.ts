import type { RawShapeMask } from '../../typings/raw'

export class SourceShapeMask {
  protected _rawValue: RawShapeMask | undefined

  constructor(mask: RawShapeMask | undefined) {
    this._rawValue = mask
  }

  // TODO remove in the end
  get RAW() {
    return this._rawValue
  }
}
