import type { RawBlendMode, RawColor, RawPointHV, RawUnitAngle, RawUnitPercent } from './shared'

export type RawShapeTransparency = {
  location?: number
  midpoint?: number
  opacity?: RawUnitPercent
}

export type RawShapeGradientColors = {
  color?: RawColor
  location?: number
  midpoint?: number
  type?: 'userStop'
}

export type RawFillGradient = {
  colors?: RawShapeGradientColors[]
  gradientForm?: 'customStops'
  interfaceIconFrameDimmed?: number
  name?: string
  transparency?: RawShapeTransparency[]
}

export type RawFillPattern = {
  ID?: string
  name?: string
}

export type RawGradientType = 'linear' | 'radial' | 'reflected' | 'Angl' | 'Dmnd'

export type RawGradientsInterpolationMethod = 'Perc' | 'Lnr ' | 'Gcls'

export type RawShapeStrokeOffset = {
  horizontal?: RawUnitPercent
  vertical?: RawUnitPercent
}

export type RawFill = {
  align?: boolean
  angle?: RawUnitAngle
  Angl?: RawUnitAngle
  class?: 'solidColorLayer' | 'gradientLayer' | 'patternLayer'
  paintType?: 'solidColor' | 'gradientFill' | 'pattern'
  color?: RawColor
  dither?: boolean
  gradient?: RawFillGradient
  gradientsInterpolationMethod?: RawGradientsInterpolationMethod
  offset?: RawShapeStrokeOffset
  pattern?: RawFillPattern
  reverse?: boolean
  scale?: RawUnitPercent
  type?: RawGradientType
  enabled?: boolean
  mode?: RawBlendMode
  opacity?: RawUnitPercent
  phase?: RawPointHV
  present?: boolean
  showInDialog?: boolean
  overprint?: boolean
  size?: number
  style?: 'outsetFrame' | 'insetFrame' | 'centeredFrame'
}

export type RawEffectStroke = {
  color?: RawColor
  enabled?: boolean
  mode?: 'normal'
  opacity?: RawUnitPercent
  overprint?: boolean
  paintType?: 'solidColor' | 'gradientFill'
  present?: boolean
  showInDialog?: boolean
  size?: number
  style?: 'outsetFrame'
}

export type RawLayerEffects = {
  masterFXSwitch?: boolean
  numModifyingFX?: number
  solidFill?: RawFill
  gradientFill?: RawFill
  patternFill?: RawFill
  frameFX?: RawFill
  scale?: RawUnitPercent
}
