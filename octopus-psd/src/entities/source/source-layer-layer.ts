import type { RawLayerLayer } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'
import { SourceLayerCommon } from './source-layer-common'

type SourceLayerLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerLayer
}

export class SourceLayerLayer extends SourceLayerCommon {
  protected _rawValue: RawLayerLayer
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerLayerOptions) {
    super(options)
    this._parent = options.parent
    this._rawValue = options.rawValue
  }
}
