export type RawColor = Partial<{
  Rd: number
  Grn: number
  Bl: number
}>

export type RawBounds = Partial<{
  Top: number
  Left: number
  Btom: number
  Rght: number
}>

export type RawUnitPoint = {
  units?: 'pointsUnit'
  value?: number
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

export type RawCombineOperation = 'add' | 'subtract' | 'interfaceIconFrameDimmed' | 'xor'
