import type { RawLayerText } from '../../typings/raw'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { getBoundsFor, getMatrixFor } from '../../utils/source'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText
  protected _parent: SourceLayerParent

  static DEFAULT_ORIENTATION = 'horizontal'

  constructor(options: SourceLayerTextOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  get bitmapBounds() {
    return getBoundsFor(this._rawValue.bitmapBounds)
  }

  get text() {
    const text = this._rawValue.text
    return {
      ...text,
      orientation: text?.orientation ?? SourceLayerText.DEFAULT_ORIENTATION,
      transform: getMatrixFor(text?.transform),
    }
  }
}
