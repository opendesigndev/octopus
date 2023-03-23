import type { SourceDesign } from './source-design.js'

export type RawSourceInteractions = Record<string, unknown>

type SourceInteractionsOptions = {
  rawValue: RawSourceInteractions
  path: string
  design: SourceDesign
}

export class SourceInteractions {
  private _rawValue: RawSourceInteractions
  private _path: string
  private _design: SourceDesign

  constructor(options: SourceInteractionsOptions) {
    this._design = options.design
    this._rawValue = options.rawValue
    this._path = options.path
  }

  get raw(): RawSourceInteractions {
    return this._rawValue
  }
}
