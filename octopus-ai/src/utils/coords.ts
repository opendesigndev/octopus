import chunk from 'lodash/chunk.js'

import type { Coord } from '../typings/index.js'
import type { RawShapeLayerSubPathPoint } from '../typings/raw/index.js'
import type { RawGraphicsStateMatrix } from '../typings/raw/graphics-state.js'

export type TransformOptions = {
  matrix: [number, number, number, number, number, number]
}

export type RectCoords = { x0: number; y0: number; x1: number; y1: number }

export function transformCoords(matrix: RawGraphicsStateMatrix, coords: number[]): number[] {
  return chunk(coords, 2).flatMap((coord: Coord) => transformCoord(matrix, coord))
}

export function transformCoord(matrix: RawGraphicsStateMatrix, point: Coord): number[] {
  const [x, y] = point
  const [a, b, c, d] = matrix

  return [a * x + b * y, c * x + d * y]
}

//note: y axis is inverted
export function getIsPositiveOrientation(width: number, height: number): boolean {
  return width * height < 0
}

export function getNorthEastSouthWestCoords(rectPoints: Coord[]): RectCoords {
  const [x0, y0] = calculateTopLeftCorner(rectPoints)
  const [x1, y1] = calculateBottomRightCorner(rectPoints)

  return { x0, y0, x1, y1 }
}

export function getNorthWestSouthEastCoords(rectPoints: Coord[]): RectCoords {
  const [x0, y0] = calculateTopRightCorner(rectPoints)
  const [x1, y1] = calculateBottomLeftCorner(rectPoints)

  return { x0, y0, x1, y1 }
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

export function getX(coords: Coord[]): number[] {
  return coords.map(([x]) => x)
}

export function getY(coords: Coord[]): number[] {
  return coords.map(([, y]) => y)
}

export function calculateBottomRightCorner(coords: Coord[]): Coord {
  return [Math.max(...getX(coords)), Math.max(...getY(coords))]
}

export function calculateTopLeftCorner(coords: Coord[]): Coord {
  return [Math.min(...getX(coords)), Math.min(...getY(coords))]
}

export function calculateTopRightCorner(coords: Coord[]): Coord {
  return [Math.max(...getX(coords)), Math.min(...getY(coords))]
}

export function calculateBottomLeftCorner(coords: Coord[]): Coord {
  return [Math.min(...getX(coords)), Math.max(...getY(coords))]
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
