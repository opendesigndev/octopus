import { RawFillGradient } from './gradient-fill'
import { RawBlendMode } from './blend-mode'
import { RawEffectDropShadow } from './drop-shadow'
import { RawSolidFill } from './solid-fill'
import { RawStroke } from './stroke'
import { RawFillImage } from './image-fill'
import { RawBlur } from './blur'


export type RawTextDecoration = 'underline' | 'line-through'

export type RawStyle = {
  blendMode?: RawBlendMode,
  opacity?: number,
  fill?: RawSolidFill | RawFillGradient | RawFillImage,
  stroke?: RawStroke,
  filters?: (RawEffectDropShadow | RawBlur)[],
  clipPath?: {
    ref?: string
  },
  font?: {
    postscriptName?: string,
    family?: string,
    style?: string,
    size?: number
  },
  textAttributes?: {
    lineHeight?: number,
    paragraphAlign?: 'center' | 'right' | 'left',
    letterSpacing?: number,
    decoration?: RawTextDecoration[],
    paragraphAfterSpacing?: number
  }
}