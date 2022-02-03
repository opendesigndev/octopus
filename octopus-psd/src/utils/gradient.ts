import { mod, tan } from './math'
import { createPath, createPoint } from './paper-factories'

type Point = { x: number; y: number }

function variantA({ angle, inverse }: LinearGradientPointsParams): [Point, Point] {
  const p1 = { x: 0, y: 0.5 + tan(angle) / 2 }
  const p2 = { x: 1, y: 0.5 - tan(angle) / 2 }
  return inverse ? [p2, p1] : [p1, p2]
}

function variantB({ angle, inverse }: LinearGradientPointsParams): [Point, Point] {
  const p1 = { x: 0.5 - tan(90 - angle) / 2, y: 1 }
  const p2 = { x: 0.5 + tan(90 - angle) / 2, y: 0 }
  return inverse ? [p2, p1] : [p1, p2]
}

export type LinearGradientPointsParams = { angle: number; inverse: boolean }
export function getLinearGradientPoints(params: LinearGradientPointsParams): [Point, Point] {
  let angle = params.angle
  let inverse = params.inverse

  angle = mod(angle, 360)
  if (angle >= 180) inverse = !inverse
  angle = mod(angle, 180)

  if (angle >= 135) return variantA({ angle, inverse: !inverse })
  if (angle >= 45) return variantB({ angle, inverse })
  return variantA({ angle, inverse })
}

export function scaleLineSegment(p1: Point, p2: Point, scale: number, center: Point): [Point, Point] {
  const path = createPath([createPoint(p1.x, p1.y), createPoint(p2.x, p2.y)])
  path.scale(scale, createPoint(center.x, center.y))
  const P1 = path.firstSegment.point
  const P2 = path.lastSegment.point
  return [
    { x: P1.x, y: P1.y },
    { x: P2.x, y: P2.y },
  ]
}
