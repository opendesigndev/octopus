import type { RawColor } from '.'

export type RawStroke = {
  type?: 'solid' | 'none'
  color?: RawColor
  width?: number
  align?: 'inside' | 'outside' | 'center'
  dash?: number[]
  join?: 'miter' | 'round' | 'bevel'
  cap?: 'butt' | 'round' | 'square'
}
