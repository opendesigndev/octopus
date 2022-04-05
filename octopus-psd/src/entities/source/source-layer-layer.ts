import type { RawLayerLayer } from '../../typings/raw'
import type { RawSmartObject } from '../../typings/raw/smart-object'
import type { SourceLayerParent } from './source-layer-common'
import { SourceLayerCommon } from './source-layer-common'

type SourceLayerLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerLayer
}

export class SourceLayerLayer extends SourceLayerCommon {
  protected _rawValue: RawLayerLayer
  protected _parent: SourceLayerParent

  get smartObject(): RawSmartObject | undefined {
    return this._rawValue.smartObject
  }

  constructor(options: SourceLayerLayerOptions) {
    super(options)
    this._parent = options.parent
    this._rawValue = options.rawValue
  }
}
