import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { round } from '@avocode/octopus-common/dist/utils/math'

import { RawBoundingBox } from '../typings/raw'
import { SourceBounds } from '../typings/source'

export function getBoundsFor(value: RawBoundingBox | undefined): SourceBounds | null {
  if (value?.x === undefined && value?.y === undefined && value?.width === undefined && value?.height === undefined)
    return null
  const x = round(asFiniteNumber(value?.x, 0))
  const y = round(asFiniteNumber(value?.y, 0))
  const width = round(asFiniteNumber(value?.width, 0))
  const height = round(asFiniteNumber(value?.height, 0))
  return { x, y, width, height }
}
