import type { RawLayerCommon } from './layer'
import type { RawBounds } from './shared'

export type RawLayerBackground = RawLayerCommon & {
  type?: 'backgroundLayer'
  bitmapBounds?: RawBounds
}
