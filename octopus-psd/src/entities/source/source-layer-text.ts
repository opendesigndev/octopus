import { RawLayerText } from '../../typings/source'
import { SourceLayerCommon, SourceLayerParent } from './source-layer-common'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  _rawValue: RawLayerText
  _parent: SourceLayerParent

  constructor(options: SourceLayerTextOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  // TODO
  // TODO
  // TODO
}
