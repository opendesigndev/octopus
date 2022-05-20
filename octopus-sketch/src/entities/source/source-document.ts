import type { SourceDesign } from './source-design'
import type SketchFormat from '@sketch-hq/sketch-file-format-ts'

type SourceDocumentOptions = {
  path: string
  rawValue: SketchFormat.Document
  design: SourceDesign
}

export class SourceDocument {
  private _path: string
  private _rawValue: SketchFormat.Document
  private _design: SourceDesign

  constructor(options: SourceDocumentOptions) {
    this._path = options.path
    this._rawValue = options.rawValue
    this._design = options.design
  }
}
