import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerVector } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerVectorOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerVector
}

export class SourceLayerVector extends SourceLayerCommon {
  protected _rawValue: RawLayerVector

  constructor(options: SourceLayerVectorOptions) {
    super(options)
  }

  // TODO
}
