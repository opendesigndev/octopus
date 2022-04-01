import { RawColor } from '.'

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
