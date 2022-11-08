import type { RawBlendMode, RawColor, RawVector } from './shared'

export type RawEffectType = 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR'

export type RawEffect = {
  type?: RawEffectType
  visible?: boolean
  radius?: number
  color?: RawColor
  blendMode?: RawBlendMode
  offset?: RawVector
  spread?: number
  showShadowBehindNode?: boolean
}
