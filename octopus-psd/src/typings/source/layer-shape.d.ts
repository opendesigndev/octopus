import type { RawAngleUnit, RawBounds, RawColor, RawPercentUnit } from './shared'
import type { RawLayerCommon } from './layer'

export type RawShapeTransparency = {
  location?: number
  midpoint?: number
  opacity?: RawPercentUnit
}

export type RawShapeGradientColors = {
  color?: RawColor
  location?: number
  midpoint?: number
  type?: 'userStop' // TODO
}

export type RawShapeGradient = {
  colors?: RawShapeGradientColors[]
  gradientForm?: 'customStops' // TODO
  interfaceIconFrameDimmed?: number
  name?: string
  transparency?: RawShapeTransparency[]
}

export type RawShapeFill = {
  class?: 'solidColorLayer' | 'gradientLayer' // TODO
  color?: RawColor
  dither?: boolean
  gradientsInterpolationMethod?: 'Perc' // TODO
  type?: 'linear' // TODO
  angle?: RawAngleUnit
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
  pathComponents?: [] // TODO
}

export type RawShapeStrokeStyleContent = {
  color?: RawColor
  align?: boolean
  angle?: RawAngleUnit
  dither?: boolean
  gradient?: RawShapeGradient
}

export type RawShapeStrokeStyle = {
  fillEnabled?: boolean
  strokeEnabled?: boolean
  strokeStyleBlendMode?: 'normal' // TODO
  strokeStyleContent?: RawShapeStrokeStyleContent
  strokeStyleLineAlignment?: 'strokeStyleAlignCenter' // TODO
  strokeStyleLineCapType?: 'strokeStyleButtCap' // TODO
  strokeStyleLineDashOffset?: {
    units?: 'pointsUnit' // TODO
    value?: number
  }
  strokeStyleLineJoinType?: 'strokeStyleMiterJoin' // TODO
  strokeStyleLineWidth?: number
  strokeStyleMiterLimit?: number
  strokeStyleOpacity?: {
    units?: 'percentUnit' // TODO
    value?: number
  }
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
