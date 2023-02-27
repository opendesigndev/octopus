import type { RawBlendMode, RawColor, RawPointHV, RawUnitAngle, RawUnitPercent } from './shared.js'

export type RawShapeTransparency = {
  location?: number
  midpoint?: number
  opacity?: RawUnitPercent
}

export type RawShapeGradientColor = {
  color?: RawColor
  location?: number
  midpoint?: number
  type?: 'userStop'
}

export type RawFillGradient = {
  colors?: RawShapeGradientColor[]
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

export type RawEffectCommon = {
  enabled?: boolean
  present?: boolean
  showInDialog?: boolean
}

export type RawFill = RawEffectCommon & {
  align?: boolean
  angle?: RawUnitAngle
  Angl?: RawUnitAngle
  class?: 'solidColorLayer' | 'gradientLayer' | 'patternLayer'
  color?: RawColor
  dither?: boolean
  gradient?: RawFillGradient
  gradientsInterpolationMethod?: RawGradientsInterpolationMethod
  offset?: RawShapeStrokeOffset
  pattern?: RawFillPattern
  reverse?: boolean
  scale?: RawUnitPercent
  type?: RawGradientType
  mode?: RawBlendMode
  opacity?: RawUnitPercent
  phase?: RawPointHV | RawShapeStrokeOffset
}

export type RawTransferSpec = {
  curve?: RawPointHV[]
  name?: 'Linear'
}

export type RawEffectShadow = RawEffectCommon & {
  antiAlias?: boolean
  blur?: number
  chokeMatte?: number
  color?: RawColor
  distance?: number
  localLightingAngle?: RawUnitAngle
  mode?: RawBlendMode
  noise?: RawUnitPercent
  opacity?: RawUnitPercent
  transferSpec?: RawTransferSpec
  useGlobalAngle?: boolean
}

export type RawEffectGlow = RawEffectShadow & {
  glowTechnique?: 'softMatte'
  innerGlowSource?: 'edgeGlow'
}

export type RawEffectStrokeLineAlignment = 'outsetFrame' | 'insetFrame' | 'centeredFrame'

export type RawEffectStroke = RawFill & {
  paintType?: 'solidColor' | 'gradientFill' | 'pattern'
  overprint?: boolean
  size?: number
  style?: RawEffectStrokeLineAlignment
}

export type RawEffectBevelEmboss = RawEffectCommon & {
  antialiasGloss?: boolean
  bevelDirection?: 'stampIn'
  bevelStyle?: 'innerBevel'
  bevelTechnique?: 'softMatte'
  blur?: number
  highlightColor?: RawColor
  highlightMode?: RawBlendMode
  highlightOpacity?: RawUnitPercent
  localLightingAltitude?: RawUnitAngle
  localLightingAngle?: RawUnitAngle
  shadowColor?: RawColor
  shadowMode?: RawBlendMode
  shadowOpacity?: RawUnitPercent
  softness?: number
  strengthRatio?: RawUnitPercent
  transferSpec?: RawTransferSpec
  useGlobalAngle?: boolean
  useShape?: boolean
  useTexture?: boolean
}

export type RawEffectSatin = RawEffectCommon & {
  antiAlias?: boolean
  blur?: number
  color?: RawColor
  distance?: number
  invert?: boolean
  localLightingAngle?: RawUnitAngle
  mappingShape?: RawTransferSpec
  mode?: RawBlendMode
  opacity?: RawUnitPercent
}

export type RawLayerEffects = {
  masterFXSwitch?: boolean
  numModifyingFX?: number
  solidFill?: RawFill
  gradientFill?: RawFill
  patternFill?: RawFill
  frameFX?: RawEffectStroke
  innerShadow?: RawEffectShadow
  dropShadow?: RawEffectShadow
  innerGlow?: RawEffectGlow
  outerGlow?: RawEffectGlow
  bevelEmboss?: RawEffectBevelEmboss
  chromeFX?: RawEffectSatin
  scale?: RawUnitPercent
}
