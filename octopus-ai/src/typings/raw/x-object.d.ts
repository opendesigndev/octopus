import { RawGraphicsState } from './graphics-state'

export type RawXObjectLayer = {
  Type?: 'XObject'
  Name?: string
  GraphicsState?: RawGraphicsState
}
