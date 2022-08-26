import chunk from 'lodash/chunk'

import type { Coord } from '../typings/index'
import type { RawShapeLayerSubPathPoint } from '../typings/raw'
import type { RawGraphicsStateMatrix } from '../typings/raw/graphics-state'

export type TransformOptions = {
  matrix: [number, number, number, number, number, number]
}

export function transformCoords(matrix: RawGraphicsStateMatrix, coords: number[]): number[] {
  return chunk(coords, 2).flatMap((coord: Coord) => transformCoord(matrix, coord))
}

export function transformCoord(matrix: RawGraphicsStateMatrix, point: Coord): number[] {
  const [x, y] = point
  const [a, b, c, d] = matrix

  return [a * x + b * y, c * x + d * y]
}

export function createRectPoints(coords: number[]): Coord[] {
  const [x, y, width, height] = coords
  const points: Coord[] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
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

export function invertYCooords(coords: number[], artboardHeight: number): number[] {
  return coords.map((coord, index) => (index % 2 ? artboardHeight - coord : coord))
}
