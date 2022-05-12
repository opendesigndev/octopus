import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerBackground } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerBackgroundOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerBackground
}

export class SourceLayerBackground extends SourceLayerCommon {
  protected _rawValue: RawLayerBackground

  constructor(options: SourceLayerBackgroundOptions) {
    super(options)
  }
}
