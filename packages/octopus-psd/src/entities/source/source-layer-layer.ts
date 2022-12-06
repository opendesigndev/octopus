import { SourceLayerCommon } from './source-layer-common.js'

import type { RawLayerLayer } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerLayer
}

export class SourceLayerLayer extends SourceLayerCommon {
  constructor(options: SourceLayerLayerOptions) {
    super(options)
  }

  //todo could not invoke smartObject
  get smartObject(): any {
    return this._rawValue.parsedProperties?.SoLd ?? this._rawValue.parsedProperties?.SoLe
  }
}
