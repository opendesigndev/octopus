import type { RawLayerLayer } from '../../typings/source'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerLayer
}

export class SourceLayerLayer extends SourceLayerCommon {
  protected _rawValue: RawLayerLayer
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerLayerOptions) {
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

  get layerEffects() {
    return {} // TODO
  }

  get smartObject() {
    return {} // TODO
  }
}
