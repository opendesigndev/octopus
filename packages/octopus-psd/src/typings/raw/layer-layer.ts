import type { RawLayerCommon } from './layer.js'
import type { RawBounds } from './shared.js'
import type { RawSmartObject } from './smart-object.js'

export type RawLayerLayer = RawLayerCommon & {
  type?: 'layer'
  bitmapBounds?: RawBounds
  smartObject?: RawSmartObject
}
