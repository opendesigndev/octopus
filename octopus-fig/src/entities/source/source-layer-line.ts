import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerLine } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerLineOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerLine
}

export class SourceLayerLine extends SourceLayerCommon {
  protected _rawValue: RawLayerLine

  constructor(options: SourceLayerLineOptions) {
    super(options)
  }

  // TODO
}
