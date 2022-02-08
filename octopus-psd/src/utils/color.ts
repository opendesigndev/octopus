import type { Octopus } from '../typings/octopus'
import type { RawColor } from '../typings/source'
import { asNumber } from '@avocode/octopus-common/dist/utils/as'

export function convertColor(color: RawColor | undefined): Octopus['Color'] {
  return {
    r: asNumber(color?.red, 0) / 255,
    g: asNumber(color?.green, 0) / 255,
    b: asNumber(color?.blue, 0) / 255,
    a: 1,
  }
}
