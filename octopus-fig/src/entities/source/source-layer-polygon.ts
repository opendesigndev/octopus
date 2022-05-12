import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerPolygon } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerPolygonOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerPolygon
}

export class SourceLayerPolygon extends SourceLayerCommon {
  protected _rawValue: RawLayerPolygon

  constructor(options: SourceLayerPolygonOptions) {
    super(options)
  }

  // TODO
}
