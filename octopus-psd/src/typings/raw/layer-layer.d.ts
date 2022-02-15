import type { RawLayerCommon } from './layer'
import type { RawBounds } from './shared'
import type { RawSmartObject } from './smart-object'

export type RawLayerEffect = {
  // TODO
}

export type RawLayerLayer = RawLayerCommon & {
  type?: 'layer'
  bitmapBounds?: RawBounds
  layerEffects?: RawLayerEffect
  smartObject?: RawSmartObject
}
