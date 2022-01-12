import { RawBounds } from './shared'
import { RawLayerCommon } from './layer'

export type RawBackgroundLayer = RawLayerCommon & {
  type?: 'backgroundLayer'
  bitmapBounds?: RawBounds
}
