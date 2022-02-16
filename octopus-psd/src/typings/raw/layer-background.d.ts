import type { RawBounds } from './shared'
import type { RawLayerCommon } from './layer'

export type RawLayerBackground = RawLayerCommon & {
  type?: 'backgroundLayer'
  bitmapBounds?: RawBounds
}
