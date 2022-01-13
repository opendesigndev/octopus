import { RawLayerBackground } from '../../typings/source'
import { SourceLayerCommon, SourceLayerParent } from './source-layer-common'

type SourceLayerBackgroundOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerBackground
}

export class SourceLayerBackground extends SourceLayerCommon {
  _rawValue: RawLayerBackground
  _parent: SourceLayerParent

  constructor(options: SourceLayerBackgroundOptions) {
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
}
