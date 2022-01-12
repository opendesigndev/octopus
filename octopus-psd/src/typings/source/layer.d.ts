import { RawBounds } from './shared'
import { RawLayerBackground } from './layer-background'
import { RawLayerSection } from './layer-section'
import { RawLayerShape } from './layer-shape'
import { RawLayerText } from './layer-text'

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
