import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'

import type {
  RawLayer,
  RawBounds,
  RawColor,
  RawMatrix,
  RawPointXY,
  RawRadiiCorners,
  RawTextBounds,
  RawUnitPoint,
} from '../typings/raw'
import type { SourceBounds, SourceColor, SourceMatrix, SourcePointXY, SourceRadiiCorners } from '../typings/source'

export function isArtboard(raw: RawLayer) {
  return Boolean(raw.artboard)
}

export function getArtboardColor(raw: RawLayer): SourceColor | null {
  switch (raw.artboard?.artboardBackgroundType) {
    case 1: // white
      return getColorFor({ blue: 255, green: 255, red: 255 })
    case 2: // black
      return getColorFor({ blue: 0, green: 0, red: 0 })
    case 3: // transparent
      return null
    case 4: // other
      return getColorFor(raw.artboard?.color)
  }
  return null
}

function getValue(value: number | RawUnitPoint | undefined): number | undefined {
  return typeof value === 'object' ? value.value : value
}

export function getBoundsFor(value: RawBounds | RawTextBounds | undefined): SourceBounds {
  const right = asFiniteNumber(getValue(value?.right), 0)
  const left = asFiniteNumber(getValue(value?.left), 0)
  const bottom = asFiniteNumber(getValue(value?.bottom), 0)
  const top = asFiniteNumber(getValue(value?.top), 0)
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
    b: asFiniteNumber(blue, 0),
    g: asFiniteNumber(green, 0),
    r: asFiniteNumber(red, 0),
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
