import type { RawLayerBackground } from '../../typings/source'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerBackgroundOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerBackground
}

export class SourceLayerBackground extends SourceLayerCommon {
  protected _rawValue: RawLayerBackground
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerBackgroundOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }
}
