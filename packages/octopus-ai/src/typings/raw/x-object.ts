import type { RawGraphicsState } from './graphics-state.js'

export type RawXObjectLayer = {
  Type?: 'XObject'
  Name?: string
  GraphicsState?: RawGraphicsState
}
