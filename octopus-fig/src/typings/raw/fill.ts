import type { RawBlendMode, RawColor, RawPosition } from './shared'

export type RawFill = RawFillSolid | RawFillImage | RawFillGradientDiamond // TODO

export type RawFillSolid = {
  blendMode?: RawBlendMode
  type?: 'SOLID'
  color?: RawColor
}

export type RawStop = {
  color?: RawColor
  position?: number
}

export type RawFillGradientDiamond = {
  opacity?: number
  blendMode?: RawBlendMode
  type?: 'GRADIENT_DIAMOND'
  gradientHandlePositions?: RawPosition[]
  gradientStops?: RawStop[]
}

export type RawFillImage = {
  blendMode?: RawBlendMode
  type?: 'IMAGE'
  scaleMode?: 'FILL' // TODO
  imageRef?: string
}
