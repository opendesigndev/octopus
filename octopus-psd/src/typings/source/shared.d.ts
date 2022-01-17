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

type RawTextBound = {
  units?: 'pointsUnit'
  value?: number
}

export type RawTextBounds = {
  bottom?: RawTextBound
  left?: RawTextBound
  right?: RawTextBound
  top?: RawTextBound
}

export type RawColor = {
  blue?: number
  green?: number
  red?: number
}

export type RawPercentUnit = {
  units?: 'percentUnit'
  value?: number
}

export type RawAngleUnit = {
  units?: 'angleUnit'
  value?: number
}

export type RawFraction = {
  denominator?: number
  numerator?: number
}

export type RawBlendOptions = {
  mode?: string
  opacity?: RawPercentUnit
}
