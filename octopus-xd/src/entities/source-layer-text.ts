import { RawTextLayer } from '../typings/source'
import SourceLayerCommon, { SourceLayerParent } from './source-layer-common'


type SourceLayerTextOptions = {
  parent: SourceLayerParent,
  rawValue: RawTextLayer
}

export default class SourceLayerText extends SourceLayerCommon {
  _rawValue: RawTextLayer
  _parent: SourceLayerParent

  constructor(options: SourceLayerTextOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  get textValue() {
    return this._rawValue?.text?.rawText
  }

  get attributes() {
    return this._rawValue?.style?.textAttributes
  }
}