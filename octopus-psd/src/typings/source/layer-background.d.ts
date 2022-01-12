import { RawBounds } from './bounds'
import { RawLayerCommon } from './layer'

export type RawBackgroundLayer = RawLayerCommon & {
  type?: 'backgroundLayer'
}
