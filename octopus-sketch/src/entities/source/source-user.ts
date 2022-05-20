import type { SourceDesign } from './source-design'
import type SketchFormat from '@sketch-hq/sketch-file-format-ts'

type SourceUserOptions = {
  path: string
  rawValue: SketchFormat.User
  design: SourceDesign
}

export class SourceUser {
  private _path: string
  private _rawValue: SketchFormat.User
  private _design: SourceDesign

  constructor(options: SourceUserOptions) {
    this._path = options.path
    this._rawValue = options.rawValue
    this._design = options.design
  }
}
