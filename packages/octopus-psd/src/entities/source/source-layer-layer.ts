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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get smartObject(): any {
    return this._rawValue.layerProperties?.SoLd ?? this._rawValue.layerProperties?.SoLe
  }
}
