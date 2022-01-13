import type { RawLayerBackground } from './layer-background'
import type { RawLayerSection } from './layer-section'
import type { RawLayerShape } from './layer-shape'
import type { RawLayerText } from './layer-text'
import type { RawBounds } from './shared'

export type RawLayerCommon = {
  bounds?: RawBounds
  clipped?: boolean
  id?: number
  imageEffectsApplied?: boolean
  imageName?: string
  name?: string
  visible?: boolean
}

export type RawLayer = RawLayerSection | RawLayerShape | RawLayerText | RawLayerBackground
