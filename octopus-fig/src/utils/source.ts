import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { round } from '@avocode/octopus-common/dist/utils/math'

import type { RawBoundingBox, RawSize, RawTransform } from '../typings/raw'
import type { SourceBounds, SourceSize, SourceTransform } from '../typings/source'

export function getBoundsFor(value: RawBoundingBox | undefined): SourceBounds | null {
  if (value?.x === undefined && value?.y === undefined && value?.width === undefined && value?.height === undefined)
    return null
  const x = round(asFiniteNumber(value?.x, 0))
  const y = round(asFiniteNumber(value?.y, 0))
  const width = round(asFiniteNumber(value?.width, 0))
  const height = round(asFiniteNumber(value?.height, 0))
  return { x, y, width, height }
}

export function getSizeFor(value: RawSize | undefined): SourceSize | null {
  if (value?.x === undefined && value?.y === undefined) return null
  const x = round(asFiniteNumber(value?.x, 0))
  const y = round(asFiniteNumber(value?.y, 0))
  return { x, y }
}

export function getTransformFor(value: RawTransform | undefined): SourceTransform | null {
  const [m1, m2] = value ?? []
  if (!Array.isArray(m1) || !Array.isArray(m2)) return null
  const [a, c, tx] = m1
  const [b, d, ty] = m2
  return [a, b, c, d, tx, ty]
}
