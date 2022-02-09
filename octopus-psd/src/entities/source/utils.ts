import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import type { RawBounds, RawColor, RawMatrix, RawPointXY, RawRadiiCorners } from '../../typings/source'
import type { SourceBounds, SourcePointXY, SourceColor, SourceMatrix, SourceRadiiCorners } from './types'

export function getBoundsFor(value: RawBounds | undefined): SourceBounds {
  return {
    right: asFiniteNumber(value?.right, 0),
    left: asFiniteNumber(value?.left, 0),
    bottom: asFiniteNumber(value?.bottom, 0),
    top: asFiniteNumber(value?.top, 0),
  }
}

export function getRadiiCornersFor(value: RawRadiiCorners | undefined): SourceRadiiCorners {
  return {
    topLeft: asFiniteNumber(value?.topLeft, 0),
    topRight: asFiniteNumber(value?.topRight, 0),
    bottomRight: asFiniteNumber(value?.bottomRight, 0),
    bottomLeft: asFiniteNumber(value?.bottomLeft, 0),
  }
}

export function getColorFor(value: RawColor | undefined): SourceColor {
  return {
    blue: asFiniteNumber(value?.blue, 0),
    green: asFiniteNumber(value?.green, 0),
    red: asFiniteNumber(value?.red, 0),
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
