import { RawResources } from '../typings/source/resources'
import SourceDesign from './source-design'


type SourceResourcesOptions = {
  rawValue: RawResources,
  path: string,
  design: SourceDesign
}

export default class SourceResources {
  _rawValue: RawResources
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

  get clipPaths() {
    return this.raw?.resources?.clipPaths || null
  }

  getClipPathById(id: string) {
    return this.clipPaths?.[id]?.children?.[0] || null
  }
}