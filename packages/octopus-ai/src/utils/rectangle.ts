import { createRectPoints } from './coords'

import type { SourceLayerShapeSubPath } from '../entities/source/source-layer-shape-subpath'
import type { Coord } from '../typings'
import type { Octopus } from '../typings/octopus'

export type RectCoords = { x0: number; y0: number; x1: number; y1: number }

function getX(coords: Coord[]): number[] {
  return coords.map(([x]) => x)
}

function getY(coords: Coord[]): number[] {
  return coords.map(([, y]) => y)
}

function calculateBottomRightCorner(coords: Coord[]): Coord {
  return [Math.max(...getX(coords)), Math.max(...getY(coords))]
}

function calculateTopLeftCorner(coords: Coord[]): Coord {
  return [Math.min(...getX(coords)), Math.min(...getY(coords))]
}

function calculateTopRightCorner(coords: Coord[]): Coord {
  return [Math.max(...getX(coords)), Math.min(...getY(coords))]
}

function calculateBottomLeftCorner(coords: Coord[]): Coord {
  return [Math.min(...getX(coords)), Math.max(...getY(coords))]
}

function getNorthEastSouthWestCoords(rectPoints: Coord[]): RectCoords {
  const [x0, y0] = calculateTopLeftCorner(rectPoints)
  const [x1, y1] = calculateBottomRightCorner(rectPoints)

  return { x0, y0, x1, y1 }
}

function getNorthWestSouthEastCoords(rectPoints: Coord[]): RectCoords {
  const [x0, y0] = calculateTopRightCorner(rectPoints)
  const [x1, y1] = calculateBottomLeftCorner(rectPoints)

  return { x0, y0, x1, y1 }
}

//note: y axis is inverted
function getIsPositiveOrientation(width: number, height: number): boolean {
  return width * height < 0
}

function parseRectangleCoords(coords: number[]): RectCoords {
  const [, , width, height] = coords
  const rectPoints = createRectPoints(coords)
  const isPositiveOrientation = getIsPositiveOrientation(width, height)

  if (isPositiveOrientation) {
    return getNorthWestSouthEastCoords(rectPoints)
  }

  return getNorthEastSouthWestCoords(rectPoints)
}

export function parseRect(coords: SourceLayerShapeSubPath['_coords']): Octopus['PathRectangle'] {
  const rectangle = parseRectangleCoords(coords)

  return {
    rectangle,
    type: 'RECTANGLE',
  }
}
