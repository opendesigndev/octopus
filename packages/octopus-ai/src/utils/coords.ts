import { asNumber } from '@opendesign/octopus-common/dist/utils/as.js'

import type { Coord } from '../typings/index.js'
import type { RawShapeLayerSubPathPoint } from '../typings/raw/index.js'

export type TransformOptions = {
  matrix: [number, number, number, number, number, number]
}

export function createRectPoints(coords: number[]): Coord[] {
  const [x, y, width, height] = coords
  const [parsedX, parsedY, parsedWidth, parsedHeight] = [x, y, width, height].map((num) => asNumber(num, 0))

  const points: Coord[] = [
    [parsedX, parsedY],
    [parsedX + parsedWidth, parsedY],
    [parsedX + parsedWidth, parsedY + parsedHeight],
    [parsedX, parsedY + parsedHeight],
  ]
  return points
}

export function isValid(point: RawShapeLayerSubPathPoint): boolean {
  if (!hasExpectedType(point)) {
    return false
  }

  if (!point.Coords) {
    return false
  }

  return true
}

export function hasExpectedType(point: RawShapeLayerSubPathPoint): boolean {
  return ['Curve', 'Line', 'Move'].includes(point.Type ?? '')
}
