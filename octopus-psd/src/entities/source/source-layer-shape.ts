import { RawLayerShape } from '../../typings/source'
import { SourceLayerCommon, SourceLayerParent } from './source-layer-common'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

export class SourceLayerShape extends SourceLayerCommon {
  _rawValue: RawLayerShape
  _parent: SourceLayerParent

  constructor(options: SourceLayerShapeOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  // TODO
  // TODO
  // TODO
}
