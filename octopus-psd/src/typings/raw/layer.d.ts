import type { RawLayerLayer } from './layer-layer'
import type { RawLayerBackground } from './layer-background'
import type { RawLayerSection } from './layer-section'
import type { RawLayerShape } from './layer-shape'
import type { RawLayerText } from './layer-text'
import type { RawBlendOptions, RawBounds } from './shared'
import type { RawLayerEffects } from './effects'

export type RawShapeMask = {
  bounds?: RawBounds
  extendWithWhite?: boolean
  imageName?: string
}

export type RawLayerCommon = {
  bounds?: RawBounds
  blendOptions?: RawBlendOptions
  clipped?: boolean
  id?: number
  imageEffectsApplied?: boolean
  imageName?: string
  mask?: RawShapeMask
  name?: string
  visible?: boolean
  layerEffects?: RawLayerEffects
}

export type RawLayer = RawLayerSection | RawLayerShape | RawLayerText | RawLayerBackground | RawLayerLayer
