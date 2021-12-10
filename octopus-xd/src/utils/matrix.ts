import { RawTransform } from '../typings/source'
import { asNumber } from './as'

export function convertObjectMatrixToArray(matrix: RawTransform) {
  if (typeof matrix?.a === 'number') {
    return [
      matrix?.a,
      matrix?.b,
      matrix?.c,
      matrix?.d,
      matrix?.tx,
      matrix?.ty
    ].map(n => asNumber(n))
  }
  return null
}