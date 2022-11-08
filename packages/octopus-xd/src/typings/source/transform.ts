export type Raw2DMatrix = {
  a?: number
  b?: number
  c?: number
  d?: number
  tx?: number
  ty?: number
}

export type Raw3DMatrix = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
]

export type RawTransform = Raw2DMatrix | Raw3DMatrix
