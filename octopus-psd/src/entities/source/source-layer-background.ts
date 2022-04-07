import type { RawLayerBackground } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'
import { SourceLayerCommon } from './source-layer-common'

type SourceLayerBackgroundOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerBackground
}

export class SourceLayerBackground extends SourceLayerCommon {
  protected _rawValue: RawLayerBackground
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerBackgroundOptions) {
    super(options)
  }
}
