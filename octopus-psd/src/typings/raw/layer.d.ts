import type { RawLayerLayer } from './layer-layer'
import type { RawLayerBackground } from './layer-background'
import type { RawLayerSection } from './layer-section'
import type { RawFill, RawLayerShape } from './layer-shape'
import type { RawLayerText } from './layer-text'
import type { RawBlendOptions, RawBounds, RawUnitPercent } from './shared'

export type RawLayerEffect = {
  masterFXSwitch?: boolean
  numModifyingFX?: number
  patternFill?: RawFill
  scale?: RawUnitPercent
}

export type RawLayerCommon = {
  bounds?: RawBounds
  blendOptions?: RawBlendOptions
  clipped?: boolean
  id?: number
  imageEffectsApplied?: boolean
  imageName?: string
  name?: string
  visible?: boolean
  layerEffects?: RawLayerEffect
}

export type RawLayer = RawLayerSection | RawLayerShape | RawLayerText | RawLayerBackground | RawLayerLayer
