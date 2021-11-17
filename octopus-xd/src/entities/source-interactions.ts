import SourceDesign from "./source-design"

export type SourceInteractionsRaw = {

}

type SourceInteractionsOptions = {
  rawValue: SourceInteractionsRaw,
  path: string,
  design: SourceDesign
}

export default class SourceInteractions {
  _rawValue: SourceInteractionsRaw
  _path: string
  _design: SourceDesign

  constructor(options: SourceInteractionsOptions) {
    this._design = options.design
    this._rawValue = options.rawValue
    this._path = options.path
  }

  get raw() {
    return this._rawValue
  }
}