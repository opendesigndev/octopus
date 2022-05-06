export type RawTODO = unknown

export type RawColor = {
  r?: number
  g?: number
  b?: number
  a?: number
}

export type RawSize = {
  x?: number
  y?: number
}

export type RawPosition = RawSize

export type RawBoundingBox = {
  x?: number
  y?: number
  width?: number
  height?: number
}

export type RawTransform = [[number, number, number], [number, number, number]]

export type RawBlendMode =
  | 'COLOR'
  | 'COLOR_BURN'
  | 'COLOR_DODGE'
  | 'DARKEN'
  | 'DIFFERENCE'
  | 'EXCLUSION'
  | 'HARD_LIGHT'
  | 'HUE'
  | 'LIGHTEN'
  | 'LUMINOSITY'
  | 'MULTIPLY'
  | 'NORMAL'
  | 'OVERLAY'
  | 'PASS_THROUGH'
  | 'SATURATION'
  | 'SCREEN'
  | 'SOFT_LIGHT'

export type RawAlign = 'INSIDE' | 'CENTER' | 'OUTSIDE'

export type RawConstraintHorizontal = 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE'
export type RawConstraintVertical = 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE'

export type RawConstraints = {
  vertical?: RawConstraintVertical
  horizontal?: RawConstraintHorizontal
}

export type RawWindingRule = 'NONZERO' | 'EVENODD'

export type RawGeometry = {
  path?: string
  windingRule?: RawWindingRule
}

export type RawArcData = {
  startingAngle?: number
  endingAngle?: number
  innerRadius?: number
}
