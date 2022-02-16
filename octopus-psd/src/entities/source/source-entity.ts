export class SourceEntity {
  protected _rawValue: unknown

  constructor(raw: unknown) {
    this._rawValue = raw
  }

  get raw() {
    return this._rawValue
  }
}
