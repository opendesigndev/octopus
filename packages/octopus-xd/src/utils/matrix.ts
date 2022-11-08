import { asFiniteNumber, asNumber } from '@opendesign/octopus-common/dist/utils/as'
import { isObject } from '@opendesign/octopus-common/dist/utils/common'

import { createMatrix } from './paper'

import type { Octopus } from '../typings/octopus'
import type { Raw2DMatrix } from '../typings/source'

export function convertObjectMatrixToArray(matrix: unknown): Octopus['Transform'] | null {
  if (typeof (matrix as Raw2DMatrix)?.a === 'number') {
    const matrix2d = matrix as Raw2DMatrix
    return [matrix2d?.a, matrix2d?.b, matrix2d?.c, matrix2d?.d, matrix2d?.tx, matrix2d?.ty].map((n) => asNumber(n))
  }
  return null
}

export function convertArrayToPaperMatrix(matrix: number[]): paper.Matrix {
  const [a, b, c, d, tx, ty] = matrix
  return createMatrix(a, b, c, d, tx, ty)
}

export function convertObjectToPaperMatrix(matrix: Raw2DMatrix): paper.Matrix {
  if (!isObject(matrix)) return createMatrix(1, 0, 0, 1, 0, 0)
  const { a, b, c, d, tx, ty } = Object.fromEntries(
    Object.entries(matrix).map(([key, value]) => [key, asFiniteNumber(value, 0)])
  )
  return createMatrix(a, b, c, d, tx, ty)
}

export function convertPaperMatrixToObject(matrix: paper.Matrix): Raw2DMatrix {
  const [a, b, c, d, tx, ty] = matrix.values
  return { a, b, c, d, tx, ty }
}
