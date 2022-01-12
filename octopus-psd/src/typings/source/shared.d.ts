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
