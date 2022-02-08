import { mod, tan } from './math'
import { createPath, createPoint } from './paper-factories'

type Point = { x: number; y: number }

export type AngleToPointsParams = { angle: number; width: number; height: number }
export function angleToPoints(params: AngleToPointsParams): [Point, Point] {
  const { width, height } = params
  const angle = mod(params.angle, 360)
  const over180 = angle >= 180
  const side = (angle: number, isReverted: boolean) => {
    const relation = angle % 180 > 90 ? width / height : height / width
    const value = relation > tan(angle % 90)
    return isReverted ? !value : value
  }
  const halfW = width / 2
  const halfH = height / 2
  const angleNormalized = angle % 90
  const isReverted = (angle >= 90 && angle < 180) || (angle >= 270 && angle < 360)
  const tg1 = tan(isReverted ? angle : angleNormalized)
  const tg2 = tan(isReverted ? 90 - angle : 90 - angleNormalized)
  const onY = side(angle, isReverted)
  const x2 = Math.round(onY ? width : halfW + halfH * tg2)
  const y2 = Math.round(onY ? halfH - halfW * tg1 : 0)
  const x1 = onY ? 0 : width - x2
  const y1 = onY ? height - y2 : height
  const invertException = isReverted && tan(angleNormalized) > width / height
  return (invertException ? !over180 : over180)
    ? [
        { x: x2 / width, y: y2 / height },
        { x: x1 / width, y: y1 / height },
      ]
    : [
        { x: x1 / width, y: y1 / height },
        { x: x2 / width, y: y2 / height },
      ]
}

type ScaleLineSegmentParams = {
  p1: Point
  p2: Point
  horizontal: number
  vertical: number
  center: Point
}
export function scaleLineSegment({ p1, p2, horizontal, vertical, center }: ScaleLineSegmentParams): [Point, Point] {
  const path = createPath([createPoint(p1.x, p1.y), createPoint(p2.x, p2.y)])
  path.scale(horizontal, vertical, createPoint(center.x, center.y))
  const P1 = path.firstSegment.point
  const P2 = path.lastSegment.point
  return [
    { x: P1.x, y: P1.y },
    { x: P2.x, y: P2.y },
  ]
}
