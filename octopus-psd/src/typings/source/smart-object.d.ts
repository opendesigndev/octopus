import { RawColor, RawPercentUnit } from '.'
import type { RawBlendOptions, RawBounds, RawFraction, RawSize } from './shared'

type RawTransform = [number, number, number, number, number, number, number, number] // TODO recheck if there are always 8 numbers

type RawWarp = {
  bounds?: RawBounds
  uOrder?: number
  vOrder?: number
  warpPerspective?: number
  warpPerspectiveOther?: number
  warpRotate?: 'horizontal' // TODO
  warpStyle?: 'warpNone' // TODO
  warpValue?: number
}

type RawFilterFXListFilter = {
  Amnt?: RawPercentUnit
  'Rds '?: number
  Thsh?: number
}

type RawFilterFXList = {
  backgroundColor?: RawColor
  blendOptions?: RawBlendOptions
  enabled?: boolean
  filter?: RawFilterFXListFilter
  filterID?: number
  foregroundColor?: RawColor
  hasoptions?: boolean
  name?: string
}

type RawFilterFX = {
  enabled?: boolean
  filterFXList?: RawFilterFXList[]
  filterMaskEnable?: boolean
  filterMaskExtendWithWhite?: boolean
  filterMaskLinked?: boolean
  validAtPosition?: boolean
}

export type RawSmartObject = {
  Crop?: 1
  ID?: string
  antiAliasType?: number
  comp?: number
  duration?: RawFraction
  filterFX?: RawFilterFX
  frameCount?: number
  frameStep?: RawFraction
  nonAffineTransform?: RawTransform
  placed?: string
  resolution?: number
  size?: RawSize
  totalPages?: number
  transform?: RawTransform
  type?: number
  warp?: RawWarp
}
