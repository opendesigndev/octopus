import { RawBounds } from './bounds'
import { RawBackgroundLayer } from './layer-background'
import { RawShapeLayer } from './layer-shape'

export type RawLayerCommon = {
  bitmapBounds?: RawBounds
  bounds?: RawBounds
  clipped?: boolean
  id?: number
  imageEffectsApplied?: boolean
  imageName?: string
  name?: string
  visible?: boolean
}

export type RawLayer = RawShapeLayer | RawBackgroundLayer
