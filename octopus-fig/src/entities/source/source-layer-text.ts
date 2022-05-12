import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerText } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText

  constructor(options: SourceLayerTextOptions) {
    super(options)
  }

  get type(): 'TEXT' {
    return 'TEXT'
  }

  // TODO
}
