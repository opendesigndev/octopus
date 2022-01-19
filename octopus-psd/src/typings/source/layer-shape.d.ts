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

export type RawShapeFill = {
  class?: 'solidColorLayer' | 'gradientLayer' | 'patternLayer'
  color?: RawColor
  dither?: boolean
  gradientsInterpolationMethod?: 'Perc'
  type?: 'linear' | 'radial' | 'reflected'
  angle?: RawUnitAngle
  gradient?: RawShapeGradient
}

export type RawShapeMask = {
  bounds?: RawBounds
  extendWithWhite?: boolean
  imageName?: string
}

export type RawShapePath = {
  bounds?: RawBounds
  defaultFill?: boolean
  pathComponents?: RawPathComponent[]
}

export type RawShapeStrokeStyleContent = {
  color?: RawColor
  align?: boolean
  angle?: RawUnitAngle
  dither?: boolean
  gradient?: RawShapeGradient
}

export type RawShapeStrokeStyle = {
  fillEnabled?: boolean
  strokeEnabled?: boolean
  strokeStyleBlendMode?: RawBlendMode
  strokeStyleContent?: RawShapeStrokeStyleContent
  strokeStyleLineAlignment?: 'strokeStyleAlignCenter'
  strokeStyleLineCapType?: 'strokeStyleButtCap'
  strokeStyleLineDashOffset?: RawUnitPoint
  strokeStyleLineJoinType?: 'strokeStyleMiterJoin'
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
  path?: RawShapePath
  strokeStyle?: RawShapeStrokeStyle
}
