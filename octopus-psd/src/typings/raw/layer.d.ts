import type { RawLayerLayer } from './layer-layer'
import type { RawLayerBackground } from './layer-background'
import type { RawLayerSection } from './layer-section'
import type { RawLayerShape } from './layer-shape'
import type { RawLayerText } from './layer-text'
import type { RawBlendOptions, RawBounds } from './shared'

export type RawLayerCommon = {
  bounds?: RawBounds
  blendOptions?: RawBlendOptions
  clipped?: boolean
  id?: number
  imageEffectsApplied?: boolean
  imageName?: string
  name?: string
  visible?: boolean
}

export type RawLayer = RawLayerSection | RawLayerShape | RawLayerText | RawLayerBackground | RawLayerLayer
