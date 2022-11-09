export type RawSize = {
  height?: number
  width?: number
}

export type RawBounds = {
  bottom?: number
  left?: number
  right?: number
  top?: number
}

export type RawTextBounds = {
  bottom?: number | RawUnitPoint
  left?: number | RawUnitPoint
  right?: number | RawUnitPoint
  top?: number | RawUnitPoint
}

export type RawColor = {
  blue?: number
  green?: number
  red?: number
}

export type RawUnitPoint = {
  units?: 'pointsUnit'
  value?: number
}

export type RawUnitPercent = {
  units?: 'percentUnit'
  value?: number
}

export type RawUnitAngle = {
  units?: 'angleUnit'
  value?: number
}

export type RawFraction = {
  denominator?: number
  numerator?: number
}

export type RawPointHV = {
  horizontal?: number
  vertical?: number
}

export type RawPointXY = {
  x?: number
  y?: number
}

export type RawMatrix = {
  tx?: number
  ty?: number
  xx?: number
  xy?: number
  yx?: number
  yy?: number
}

export type RawBlendMode =
  | 'normal'
  | 'dissolve'
  | 'darken'
  | 'multiply'
  | 'colorBurn'
  | 'linearBurn'
  | 'darkerColor'
  | 'lighten'
  | 'screen'
  | 'colorDodge'
  | 'linearDodge'
  | 'lighterColor'
  | 'overlay'
  | 'softLight'
  | 'hardLight'
  | 'vividLight'
  | 'linearLight'
  | 'pinLight'
  | 'hardMix'
  | 'difference'
  | 'exclusion'
  | 'subtract'
  | 'divide'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

export type RawAlign = 'left' | 'right' | 'center' | 'justifyLeft' | 'justifyRight' | 'justifyCenter' | 'justifyAll'

export type RawCombineOperation = 'add' | 'subtract' | 'interfaceIconFrameDimmed' | 'xor'

export type RawBlendOptions = {
  mode?: RawBlendMode
  opacity?: RawUnitPercent
  fillOpacity?: RawUnitPercent
}
