import { RawLayerText } from '../../typings/source'
import { SourceLayerCommon, SourceLayerParent } from './source-layer-common'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  _rawValue: RawLayerText
  _parent: SourceLayerParent

  constructor(options: SourceLayerTextOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  get bitmapBounds() {
    return {
      right: this._rawValue.bitmapBounds?.right ?? 0,
      left: this._rawValue.bitmapBounds?.left ?? 0,
      bottom: this._rawValue.bitmapBounds?.bottom ?? 0,
      top: this._rawValue.bitmapBounds?.top ?? 0,
    }
  }

  get text() {
    return {
      TextIndex: this._rawValue.text?.TextIndex,
      boundingBox: this._rawValue.text?.boundingBox,
      bounds: this._rawValue.text?.bounds,
      orientation: this._rawValue.text?.orientation,
      paragraphStyleRange: this._rawValue.text?.paragraphStyleRange,
      textKey: this._rawValue.text?.textKey,
      textStyleRange: this._rawValue.text?.textStyleRange,
      transform: {
        tx: this._rawValue.text?.transform?.tx ?? 0,
        ty: this._rawValue.text?.transform?.ty ?? 0,
        xx: this._rawValue.text?.transform?.xx ?? 0,
        xy: this._rawValue.text?.transform?.xy ?? 0,
        yx: this._rawValue.text?.transform?.yx ?? 0,
        yy: this._rawValue.text?.transform?.yy ?? 0,
      },
    }
  }
}
