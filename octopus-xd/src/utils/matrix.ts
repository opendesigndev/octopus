import { Raw2DMatrix } from '../typings/source'
import { asNumber } from '@avocode/octopus-common/dist/utils/as'

export function convertObjectMatrixToArray(matrix: unknown) {
  if (typeof (matrix as Raw2DMatrix)?.a === 'number') {
    const matrix2d = matrix as Raw2DMatrix
    return [
      matrix2d?.a,
      matrix2d?.b,
      matrix2d?.c,
      matrix2d?.d,
      matrix2d?.tx,
      matrix2d?.ty
    ].map(n => asNumber(n))
  }
  return null
}