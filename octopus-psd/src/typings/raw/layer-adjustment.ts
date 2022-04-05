import { RawFill } from './effects'
import type { RawLayerCommon } from './layer'

export type RawLayerAdjustment = RawLayerCommon & {
  type?: 'adjustmentLayer'
  fill?: RawFill
}
