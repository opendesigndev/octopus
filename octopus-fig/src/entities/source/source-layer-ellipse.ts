import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerEllipse } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerEllipseOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerEllipse
}

export class SourceLayerEllipse extends SourceLayerCommon {
  protected _rawValue: RawLayerEllipse

  constructor(options: SourceLayerEllipseOptions) {
    super(options)
  }

  // TODO
}
