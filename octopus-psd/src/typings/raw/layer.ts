import type { RawLayerEffects } from './effects.js'
import type { RawLayerAdjustment } from './layer-adjustment.js'
import type { RawLayerBackground } from './layer-background.js'
import type { RawLayerLayer } from './layer-layer.js'
import type { RawLayerSection } from './layer-section.js'
import type { RawLayerShape } from './layer-shape.js'
import type { RawLayerText } from './layer-text.js'
import type { RawPathComponent } from './path-component.js'
import type { RawBlendOptions, RawBounds, RawColor } from './shared.js'

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

export type RawLayer =
  | RawLayerAdjustment
  | RawLayerBackground
  | RawLayerLayer
  | RawLayerSection
  | RawLayerShape
  | RawLayerText
