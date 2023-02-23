import paper from 'paper'

import type { SourceTransform } from '../typings/source'

paper.setup(new paper.Size(100, 100))

const SIMPLIFY_TOLERANCE = 0.00000001

/**
 * @see https://gitlab.avcd.cz/backend/backend/-/issues/2312
 */
export function simplifyPathData(pathData: string): string {
  if (typeof pathData !== 'string') return pathData

  const compound = new paper.CompoundPath(pathData)

  compound.children.forEach((child: paper.Path) => {
    if (child.segments.length > 100) child.simplify(SIMPLIFY_TOLERANCE)
  })

  return compound.pathData
}

const { Matrix, Point } = paper

export function createPoint(x: number, y: number): paper.Point {
  return new Point(x, y)
}

export function createMatrix([a, b, c, d, tx, ty]: SourceTransform): paper.Matrix {
  return new Matrix(a, b, c, d, tx, ty)
}

export function createCompoundPath(pathData: string): paper.CompoundPath {
  return new paper.CompoundPath(pathData)
}
