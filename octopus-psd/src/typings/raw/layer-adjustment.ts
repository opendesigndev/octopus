import type { RawFill } from './effects.js'
import type { RawLayerCommon } from './layer.js'

export type RawLayerAdjustment = RawLayerCommon & {
  type?: 'adjustmentLayer'
  fill?: RawFill
}
