import type { RawShapeLayerSubPathPoint } from '../typings/raw'
import type { RawGraphicsStateMatrix } from '../typings/raw/graphics-state'
import type { Coord } from '../typings/index'

export type TransformOptions = {
  matrix: [number, number, number, number, number, number]
}

export type RectCoords = { x0: number; y0: number; x1: number; y1: number }

export function transformCoords(matrix: RawGraphicsStateMatrix, coords: number[]): number[] {
  const result = []
  for (let i = 0; i < coords.length; i += 2) {
    result.push(...transformCoord(matrix, [coords[i], coords[i + 1]]))
  }

  return result
}

export function transformCoord(matrix: RawGraphicsStateMatrix, point: Coord): number[] {
  const [x, y] = point
  const [a, b, c, d] = matrix

  return [a * x + b * y, c * x + d * y]
}

//note: y axis is inverted
export function getIssPositiveOrientation(width: number, height: number): boolean {
  return width * height < 0
}

export function getNorthEastSouthWestCoords(rectPoints: Coord[]): RectCoords {
  const [x0, y0] = calculateTopLeftCorner(rectPoints)
  const [x1, y1] = calculateBottomRightCorner(rectPoints)

  return { x0, y0, x1, y1 }
}

export function getNorthWestSouthEasttCoords(rectPoints: Coord[]): RectCoords {
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

export function calculateBottomRightCorner(coords: Coord[]): Coord {
  return coords.reduce((coord, resultCoord) => {
    if (!resultCoord || coord[0] > resultCoord[0] || coord[1] > resultCoord[1]) {
      return [...coord]
    }
    return resultCoord
  })
}

export function calculateTopLeftCorner(coords: Coord[]): Coord {
  return coords.reduce((coord, resultCoord) => {
    if (!resultCoord || coord[0] < resultCoord[0] || coord[1] < resultCoord[1]) {
      return [...coord]
    }
    return resultCoord
  })
}

export function calculateTopRightCorner(coords: Coord[]): Coord {
  return coords.reduce((coord, resultCoord) => {
    if (!resultCoord || coord[0] > resultCoord[0] || coord[1] < resultCoord[1]) {
      return [...coord]
    }
    return resultCoord
  })
}

export function calculateBottomLeftCorner(coords: Coord[]): Coord {
  return coords.reduce((coord, resultCoord) => {
    if (!resultCoord || coord[0] < resultCoord[0] || coord[1] > resultCoord[1]) {
      return [...coord]
    }
    return resultCoord
  })
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
  const type = point.Type
  return ['Curve', 'Line', 'Move'].some((t) => t === type)
}

export function invertYCooords(coords: number[], artboardHeight: number): number[] {
  const inversedCoords = coords.map((coord, index) => {
    if (index % 2 === 0) {
      return coord
    }
    return artboardHeight - coord
  })

  return inversedCoords
}
