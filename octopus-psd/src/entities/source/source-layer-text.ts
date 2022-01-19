import type { RawLayerText } from '../../typings/source'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { getBoundsFor, getMatrixFor } from './utils'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText
  protected _parent: SourceLayerParent

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
      TextIndex: text?.TextIndex,
      boundingBox: text?.boundingBox, // TODO
      bounds: text?.bounds, // TODO
      orientation: text?.orientation ?? 'horizontal',
      paragraphStyleRange: text?.paragraphStyleRange, // TODO
      textKey: text?.textKey,
      textStyleRange: text?.textStyleRange, // TODO
      transform: getMatrixFor(text?.transform),
    }
  }
}
