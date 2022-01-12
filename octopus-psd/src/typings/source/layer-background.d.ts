import { RawBounds } from './shared'
import { RawLayerCommon } from './layer'

export type RawLayerBackground = RawLayerCommon & {
  type?: 'backgroundLayer'
  bitmapBounds?: RawBounds
}
