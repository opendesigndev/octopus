import SourceLayerCommon from './source-layer-common'

import type { RawTextLayer } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'


type SourceLayerTextOptions = {
  parent: SourceLayerParent,
  rawValue: RawTextLayer
}

export default class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawTextLayer
  protected _parent: SourceLayerParent

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

  get raw() {
    return this._rawValue
  }
}