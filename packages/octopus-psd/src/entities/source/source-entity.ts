export class SourceEntity {
  protected _rawValue: unknown

  constructor(raw: unknown) {
    this._rawValue = raw
  }

  get raw(): unknown {
    return this._rawValue
  }
}
