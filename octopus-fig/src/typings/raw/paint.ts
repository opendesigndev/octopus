import type { RawBlendMode, RawColor, RawVector, RawTransform } from './shared'

export type RawStop = {
  color?: RawColor
  position?: number
}

export type RawGradientType =
  | 'SOLID'
  | 'GRADIENT_LINEAR'
  | 'GRADIENT_RADIAL'
  | 'GRADIENT_ANGULAR'
  | 'GRADIENT_DIAMOND'
  | 'IMAGE'
  | 'EMOJI'

export type RawScaleMode = 'FILL' | 'FIT' | 'STRETCH' | 'TILE'

export type RawImageFilters = {
  exposure?: number
  contrast?: number
  saturation?: number
  temperature?: number
  tint?: number
  highlights?: number
  shadows?: number
}

export type RawPaint = {
  type?: RawGradientType
  visible?: boolean
  opacity?: number
  color?: RawColor
  blendMode?: RawBlendMode
  gradientHandlePositions?: RawVector[]
  gradientStops?: RawStop[]
  scaleMode?: RawScaleMode
  imageTransform?: RawTransform
  scalingFactor?: number
  rotation?: number
  imageRef?: string
  filters?: RawImageFilters
  gifRef?: string
}
