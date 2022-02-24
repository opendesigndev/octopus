import type { Octopus } from '../typings/octopus'
import type { RawColor } from '../typings/raw'
import { asNumber } from '@avocode/octopus-common/dist/utils/as'
import type { SourceMatrix } from '../typings/source'

export function convertColor(color: RawColor | null | undefined): Octopus['Color'] {
  return {
    r: asNumber(color?.red, 0) / 255,
    g: asNumber(color?.green, 0) / 255,
    b: asNumber(color?.blue, 0) / 255,
    a: 1,
  }
}

export function convertMatrix(matrix: SourceMatrix): Octopus['Transform'] {
  const { tx, ty, xx, xy, yx, yy } = matrix
  return [xx, xy, yx, yy, tx, ty]
}
