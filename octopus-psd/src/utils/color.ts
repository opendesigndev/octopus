import type { Octopus } from '../typings/octopus'
import type { RawColor } from '../typings/source'
import { asNumber } from './as'

export function convertColor(color: RawColor | undefined): Octopus['Color'] {
  return {
    r: asNumber(color?.red) / 255,
    g: asNumber(color?.green) / 255,
    b: asNumber(color?.blue) / 255,
    a: 1,
  }
}
