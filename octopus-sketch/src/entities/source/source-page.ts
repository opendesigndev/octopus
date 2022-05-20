import type { SourceDesign } from './source-design'
import type SketchFormat from '@sketch-hq/sketch-file-format-ts'

type SourcePageOptions = {
  path: string
  rawValue: SketchFormat.Page
  design: SourceDesign
}

export class SourcePage {
  private _path: string
  private _rawValue: SketchFormat.Page
  private _design: SourceDesign

  constructor(options: SourcePageOptions) {
    this._path = options.path
    this._rawValue = options.rawValue
    this._design = options.design
  }
}
