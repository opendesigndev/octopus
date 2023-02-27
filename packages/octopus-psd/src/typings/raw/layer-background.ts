import type { RawLayerCommon } from './layer.js'
import type { RawBounds } from './shared.js'

export type RawLayerBackground = RawLayerCommon & {
  type?: 'backgroundLayer'
  bitmapBounds?: RawBounds
}
