import { SourceLayerCommon } from './source-layer-common.js'
import PROPS from '../../utils/prop-names.js'

import type { SourceLayerParent } from './source-layer-common.js'
import type { RawLayerLayer } from '../../typings/raw/index.js'

type SourceLayerLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerLayer
}

export class SourceLayerLayer extends SourceLayerCommon {
  constructor(options: SourceLayerLayerOptions) {
    super(options)
  }

  get smartObject(): Record<string, unknown> | undefined {
    return (
      this._rawValue.layerProperties?.[PROPS.PLACED_LAYER_DATA] ??
      this._rawValue.layerProperties?.[PROPS.SMART_OBJECT_PLACED_LAYER_DATA]
    )
  }
}
