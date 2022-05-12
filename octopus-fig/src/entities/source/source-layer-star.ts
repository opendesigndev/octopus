import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerStar } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerStarOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerStar
}

export class SourceLayerStar extends SourceLayerCommon {
  protected _rawValue: RawLayerStar

  constructor(options: SourceLayerStarOptions) {
    super(options)
  }

  // TODO
}
