import { RawColor } from '../typings/source'
import { asNumber } from './as'


export function parseXDColor(color: RawColor | null | void) {
  if (color?.mode !== 'RGB') {
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    }
  }

  const [ r, g, b, a ] = [
    color?.value?.r,
    color?.value?.g,
    color?.value?.b,
    color?.alpha
  ].map(n => asNumber(n))

  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
    a
  }
}