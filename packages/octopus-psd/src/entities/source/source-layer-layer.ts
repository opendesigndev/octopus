import { SourceLayerCommon } from './source-layer-common.js'

import type { RawLayerLayer } from '../../typings/raw/index.js'
import type { RawSmartObject } from '../../typings/raw/smart-object.js'
import type { SourceLayerParent } from './source-layer-common.js'

type SourceLayerLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerLayer
}

export class SourceLayerLayer extends SourceLayerCommon {
  declare _rawValue: RawLayerLayer

  constructor(options: SourceLayerLayerOptions) {
    super(options)
  }

  get smartObject(): RawSmartObject | undefined {
    return this._rawValue.smartObject
  }
}
