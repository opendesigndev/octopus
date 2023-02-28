import { SourceLayerCommon } from './source-layer-common.js'

import type { RawLayerBackground } from '../../typings/raw/index.js'
import type { SourceLayerParent } from './source-layer-common.js'

type SourceLayerBackgroundOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerBackground
}

export class SourceLayerBackground extends SourceLayerCommon {
  declare _rawValue: RawLayerBackground

  constructor(options: SourceLayerBackgroundOptions) {
    super(options)
  }
}
