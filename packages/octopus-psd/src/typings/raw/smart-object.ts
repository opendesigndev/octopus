import type { RawBlendOptions, RawBounds, RawColor, RawFraction, RawSize, RawUnitPercent } from './shared'

type RawWarp = {
  bounds?: RawBounds
  uOrder?: number
  vOrder?: number
  warpPerspective?: number
  warpPerspectiveOther?: number
  warpRotate?: 'horizontal' | 'vertical'
  warpStyle?: 'warpNone' | 'warpFlag' | 'warpArc'
  warpValue?: number
}

type RawFilterFXListFilter = {
  Amnt?: RawUnitPercent
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
  nonAffineTransform?: number[]
  placed?: string
  resolution?: number
  size?: RawSize
  totalPages?: number
  transform?: number[]
  type?: number
  warp?: RawWarp
}
