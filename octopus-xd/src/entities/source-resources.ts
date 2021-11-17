import { deepInspect } from "../utils/common"
import SourceDesign from "./source-design"

export type SourceResourcesRaw = {

}

type SourceResourcesOptions = {
  rawValue: SourceResourcesRaw,
  path: string,
  design: SourceDesign
}

export default class SourceResources {
  _rawValue: SourceResourcesRaw
  _path: string
  _design: SourceDesign

  constructor(options: SourceResourcesOptions) {
    this._design = options.design
    this._rawValue = options.rawValue
    this._path = options.path
  }

  get raw() {
    return this._rawValue
  }
}