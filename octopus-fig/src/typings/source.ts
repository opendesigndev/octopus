export type SourceBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type SourceSize = {
  x: number
  y: number
}

export type SourceTransform = [number, number, number, number, number, number]

export type SourceFillRule = 'EVEN_ODD' | 'NON_ZERO'

export type SourceGeometry = {
  path: string
  fillRule: SourceFillRule
}
