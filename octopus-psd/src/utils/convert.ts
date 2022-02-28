import type { Octopus } from '../typings/octopus'
import type { RawColor } from '../typings/raw'
import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import type { SourceMatrix } from '../typings/source'

export function convertColor(color: RawColor | null | undefined): Octopus['Color'] {
  return {
    r: asFiniteNumber(color?.red, 0) / 255,
    g: asFiniteNumber(color?.green, 0) / 255,
    b: asFiniteNumber(color?.blue, 0) / 255,
    a: 1,
  }
}

export function convertMatrix(matrix: SourceMatrix): Octopus['Transform'] {
  const { tx, ty, xx, xy, yx, yy } = matrix
  return [xx, xy, yx, yy, tx, ty]
}

export function pointsToPixels(points: number, dpi = 72): number {
  return asFiniteNumber(points / (72 / dpi), 0)
}
