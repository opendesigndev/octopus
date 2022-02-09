import type { RawUnitAngle, RawBounds, RawColor, RawUnitPercent, RawUnitPoint, RawBlendMode } from './shared'
import type { RawLayerCommon } from './layer'
import type { RawPathComponent } from './path-component'

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

export type RawShapeGradient = {
  colors?: RawShapeGradientColors[]
  gradientForm?: 'customStops'
  interfaceIconFrameDimmed?: number
  name?: string
  transparency?: RawShapeTransparency[]
}

export type RawGradientType = 'linear' | 'radial' | 'reflected' | 'Angl' | 'Dmnd'

export type RawGradientsInterpolationMethod = 'Perc' | 'Lnr ' | 'Gcls'

export type RawShapeFill = {
  class?: 'solidColorLayer' | 'gradientLayer' | 'patternLayer'
  color?: RawColor
  dither?: boolean
  gradientsInterpolationMethod?: RawGradientsInterpolationMethod
  type?: RawGradientType
  angle?: RawUnitAngle
  gradient?: RawShapeGradient
  reverse?: boolean
  align?: boolean
  scale?: RawUnitPercent
}

export type RawShapeMask = {
  bounds?: RawBounds
  extendWithWhite?: boolean
  imageName?: string
}

export type RawPath = {
  bounds?: RawBounds
  defaultFill?: boolean
  pathComponents?: RawPathComponent[]
}

export type RawShapeStrokeOffset = {
  horizontal?: RawUnitPercent
  vertical?: RawUnitPercent
}

export type RawShapeStrokeStyleContent = {
  color?: RawColor
  align?: boolean
  angle?: RawUnitAngle
  dither?: boolean
  gradient?: RawShapeGradient
  gradientsInterpolationMethod?: RawGradientsInterpolationMethod
  offset?: RawShapeStrokeOffset
  reverse?: boolean
  scale?: RawUnitPercent
  type?: RawGradientType
}

export type RawStrokeStyleLineAlignment =
  | 'strokeStyleAlignInside'
  | 'strokeStyleAlignCenter'
  | 'strokeStyleAlignOutside'

export type RawStrokeStyleLineCapType = 'strokeStyleButtCap' | 'strokeStyleRoundCap' | 'strokeStyleSquareCap'

export type RawStrokeStyleLineJoinType = 'strokeStyleMiterJoin' | 'strokeStyleRoundJoin' | 'strokeStyleBevelJoin'

export type RawShapeStrokeStyle = {
  fillEnabled?: boolean
  strokeEnabled?: boolean
  strokeStyleBlendMode?: RawBlendMode
  strokeStyleContent?: RawShapeStrokeStyleContent
  strokeStyleLineAlignment?: RawStrokeStyleLineAlignment
  strokeStyleLineCapType?: RawStrokeStyleLineCapType
  strokeStyleLineDashOffset?: RawUnitPoint
  strokeStyleLineDashSet?: number[]
  strokeStyleLineJoinType?: RawStrokeStyleLineJoinType
  strokeStyleLineWidth?: number
  strokeStyleMiterLimit?: number
  strokeStyleOpacity?: RawUnitPercent
  strokeStyleResolution?: number
  strokeStyleScaleLock?: boolean
  strokeStyleStrokeAdjust?: boolean
  strokeStyleVersion?: number
}

export type RawLayerShape = RawLayerCommon & {
  type?: 'shapeLayer'
  alignEdges?: boolean
  fill?: RawShapeFill
  layerEffects?: {} // TODO
  mask?: RawShapeMask
  path?: RawPath
  strokeStyle?: RawShapeStrokeStyle
}
