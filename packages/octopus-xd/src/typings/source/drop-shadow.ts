import type { RawColor } from './index.js'

export type RawEffectDropShadow = {
  type?: 'dropShadow'
  global?: boolean
  visible?: boolean
  params?: {
    dropShadows?: [
      {
        dx?: number
        dy?: number
        r?: number
        color?: RawColor
      }
    ]
  }
}
