import { RawLayerBackground } from '../../typings/source'
import { SourceLayerCommon, SourceLayerParent } from './source-layer-common'

type SourceLayerBackgroundOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerBackground
}

export class SourceLayerBackground extends SourceLayerCommon {
  _rawValue: RawLayerBackground
  _parent: SourceLayerParent

  constructor(options: SourceLayerBackgroundOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  // TODO
  // TODO
  // TODO
}