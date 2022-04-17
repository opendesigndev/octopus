import type { RawFillGradient } from './fill-gradient'
import type { RawBlendMode } from './blend-mode'
import type { RawEffectDropShadow } from './drop-shadow'
import type { RawFillColor } from './fill-solid'
import type { RawStroke } from './stroke'
import type { RawFillImage } from './fill-image'
import type { RawBlur } from './blur'

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
