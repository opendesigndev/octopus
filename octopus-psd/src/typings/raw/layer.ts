import type { RawLayerEffects } from './effects'
import type { RawLayerBackground } from './layer-background'
import type { RawLayerLayer } from './layer-layer'
import type { RawLayerSection } from './layer-section'
import type { RawLayerShape } from './layer-shape'
import type { RawLayerText } from './layer-text'
import type { RawPathComponent } from './path-component'
import type { RawBlendOptions, RawBounds, RawColor } from './shared'

export type RawShapeMask = {
  bounds?: RawBounds
  extendWithWhite?: boolean
  imageName?: string
}

export type RawPath = {
  bounds?: RawBounds
  defaultFill?: boolean
  pathComponents?: RawPathComponent[]
}

export type RawLayerArtboard = {
  artboardBackgroundType?: number
  artboardPresetName?: string
  artboardRect?: RawBounds
  color?: RawColor
}

export type RawLayerCommon = {
  artboard?: RawLayerArtboard
  bounds?: RawBounds
  blendOptions?: RawBlendOptions
  clipped?: boolean
  id?: number
  imageEffectsApplied?: boolean
  imageName?: string
  mask?: RawShapeMask
  path?: RawPath
  name?: string
  visible?: boolean
  layerEffects?: RawLayerEffects
}

export type RawLayer = RawLayerSection | RawLayerShape | RawLayerText | RawLayerBackground | RawLayerLayer
