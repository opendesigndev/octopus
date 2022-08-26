import type { RawGraphicsState, RawGraphicsStateMatrix } from './graphics-state'

export type RawTextLayerText = {
  GraphicsState?: RawGraphicsState
  TextMatrix?: RawGraphicsStateMatrix
  TextLineMatrix?: number[]
  Text?: (string | number)[] | string
}

export type RawTextLayer = {
  Type?: 'TextGroup'
  Texts?: RawTextLayerText[]
}
