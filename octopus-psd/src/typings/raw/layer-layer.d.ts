import type { RawLayerCommon } from './layer'
import type { RawBounds } from './shared'
import type { RawSmartObject } from './smart-object'

export type RawLayerLayer = RawLayerCommon & {
  type?: 'layer'
  bitmapBounds?: RawBounds
  smartObject?: RawSmartObject
}
