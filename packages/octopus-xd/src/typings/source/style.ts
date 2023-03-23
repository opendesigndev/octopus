import type { RawBlendMode } from './blend-mode.js'
import type { RawBlur } from './blur.js'
import type { RawEffectDropShadow } from './drop-shadow.js'
import type { RawFillGradient } from './fill-gradient.js'
import type { RawFillImage } from './fill-image.js'
import type { RawFillColor } from './fill-solid.js'
import type { RawStroke } from './stroke.js'

export type RawTextDecoration = 'underline' | 'line-through'

export type RawStyle = {
  blendMode?: RawBlendMode
  opacity?: number
  fill?: RawFillColor | RawFillGradient | RawFillImage
  stroke?: RawStroke
  filters?: (RawEffectDropShadow | RawBlur)[]
  clipPath?: {
    ref?: string
  }
  font?: {
    postscriptName?: string
    family?: string
    style?: string
    size?: number
  }
  textAttributes?: {
    lineHeight?: number
    paragraphAlign?: 'center' | 'right' | 'left'
    letterSpacing?: number
    decoration?: RawTextDecoration[]
    paragraphAfterSpacing?: number
  }
}
