import type { SourceDesign } from './source-design'
import type SketchFormat from '@sketch-hq/sketch-file-format-ts'

type SourceMetaOptions = {
  path: string
  rawValue: SketchFormat.Meta
  design: SourceDesign
}

export class SourceMeta {
  private _path: string
  private _rawValue: SketchFormat.Meta
  private _design: SourceDesign

  constructor(options: SourceMetaOptions) {
    this._path = options.path
    this._rawValue = options.rawValue
    this._design = options.design
  }
}
