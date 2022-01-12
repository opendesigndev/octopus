import { RawBounds } from './shared'
import { RawBackgroundLayer } from './layer-background'
import { RawSectionLayer } from './layer-section'
import { RawShapeLayer } from './layer-shape'
import { RawTextLayer } from './layer-text'

export type RawLayerCommon = {
  bounds?: RawBounds
  clipped?: boolean
  id?: number
  imageEffectsApplied?: boolean
  imageName?: string
  name?: string
  visible?: boolean
}

export type RawLayer = RawShapeLayer | RawBackgroundLayer | RawSectionLayer | RawTextLayer
