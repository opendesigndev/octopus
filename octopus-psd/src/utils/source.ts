import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'

import type { RawBounds, RawColor, RawMatrix, RawPointXY, RawRadiiCorners, RawTextBounds } from '../typings/raw'
import type { SourceBounds, SourceColor, SourceMatrix, SourcePointXY, SourceRadiiCorners } from '../typings/source'

export function getBoundsFor(value: RawBounds | undefined): SourceBounds {
  const right = asFiniteNumber(value?.right, 0)
  const left = asFiniteNumber(value?.left, 0)
  const bottom = asFiniteNumber(value?.bottom, 0)
  const top = asFiniteNumber(value?.top, 0)
  const width = right - left
  const height = bottom - top
  return { right, left, bottom, top, width, height }
}

export function getTextBoundsFor(value: RawTextBounds | undefined): SourceBounds {
  const right = asFiniteNumber(value?.right?.value, 0)
  const left = asFiniteNumber(value?.left?.value, 0)
  const bottom = asFiniteNumber(value?.bottom?.value, 0)
  const top = asFiniteNumber(value?.top?.value, 0)
  const width = right - left
  const height = bottom - top
  return { right, left, bottom, top, width, height }
}

export function getRadiiCornersFor(value: RawRadiiCorners | undefined): SourceRadiiCorners {
  return {
    topLeft: asFiniteNumber(value?.topLeft, 0),
    topRight: asFiniteNumber(value?.topRight, 0),
    bottomRight: asFiniteNumber(value?.bottomRight, 0),
    bottomLeft: asFiniteNumber(value?.bottomLeft, 0),
  }
}

export function getColorFor(value: RawColor | undefined): SourceColor | null {
  const { blue, green, red } = value ?? {}
  if (blue === undefined && green === undefined && red === undefined) return null
  return {
    blue: asFiniteNumber(blue, 0),
    green: asFiniteNumber(green, 0),
    red: asFiniteNumber(red, 0),
  }
}

export function getMatrixFor(value: RawMatrix | undefined): SourceMatrix {
  return {
    xx: asFiniteNumber(value?.xx, 0),
    xy: asFiniteNumber(value?.xy, 0),
    yx: asFiniteNumber(value?.yx, 0),
    yy: asFiniteNumber(value?.yy, 0),
    tx: asFiniteNumber(value?.tx, 0),
    ty: asFiniteNumber(value?.ty, 0),
  }
}

export function getPointFor(point: RawPointXY | undefined): SourcePointXY {
  const x = asFiniteNumber(point?.x, 0)
  const y = asFiniteNumber(point?.y, 0)
  return { x, y }
}

export function getUnitRatioFor(percentage: number | undefined, defaultValue = 100): number {
  return asFiniteNumber(percentage, defaultValue) / 100
}
