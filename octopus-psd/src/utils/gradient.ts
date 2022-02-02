import { mod, tan, round15 } from './math'
import { createMatrix, createPoint } from './paper-factories'

type Point = { x: number; y: number }

function variantA({ angle, scale, inverse }: LinearGradientPointsParams): [Point, Point] {
  const p1 = { x: 0, y: round15(0.5 + tan(angle) / 2) }
  const p2 = { x: 1, y: round15(0.5 - tan(angle) / 2) }
  return inverse ? [p2, p1] : [p1, p2]
}

function variantB({ angle, scale, inverse }: LinearGradientPointsParams): [Point, Point] {
  const p1 = { x: round15(0.5 - tan(90 - angle) / 2), y: 1 }
  const p2 = { x: round15(0.5 + tan(90 - angle) / 2), y: 0 }
  return inverse ? [p2, p1] : [p1, p2]
}

export type LinearGradientPointsParams = { angle: number; scale?: number; inverse: boolean }
export function getLinearGradientPoints(params: LinearGradientPointsParams): [Point, Point] {
  let angle = params.angle
  let inverse = params.inverse
  const scale = params.scale ?? 1

  angle = mod(angle, 360)
  if (angle >= 180) inverse = !inverse
  angle = mod(angle, 180)

  if (angle >= 135) return variantA({ angle, scale, inverse: !inverse })
  if (angle >= 45) return variantB({ angle, scale, inverse })
  return variantA({ angle, scale, inverse })
}

export type Matrix = [number, number, number, number, number, number]
export function scaleMatrix(matrix: Matrix, scale: number, center: Point): Matrix {
  const M = createMatrix(...matrix)
  console.info()
  console.info()
  console.info('in', M.values)
  console.info('scale', scale)
  console.info('center', center)
  // const out = M.scale(scale, createPoint(center.x, center.y))
  const out = M.scale(scale, createPoint(0, 0))
  console.info('out', out.values)
  console.info()
  console.info()
  return out.values as Matrix
}
