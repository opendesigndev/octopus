import type { RawBounds, RawColor, RawMatrix, RawPointXY } from '../../typings/source'
import type { SourceBounds, SourcePointXY, SourceColor, SourceMatrix } from './types'

export function getBoundsFor(value: RawBounds | undefined): SourceBounds {
  return {
    right: value?.right ?? 0,
    left: value?.left ?? 0,
    bottom: value?.bottom ?? 0,
    top: value?.top ?? 0,
  }
}

export function getColorFor(value: RawColor | undefined): SourceColor {
  return {
    blue: value?.blue ?? 0,
    green: value?.green ?? 0,
    red: value?.red ?? 0,
  }
}

export function getMatrixFor(value: RawMatrix | undefined): SourceMatrix {
  return {
    xx: value?.xx ?? 0,
    xy: value?.xy ?? 0,
    yx: value?.yx ?? 0,
    yy: value?.yy ?? 0,
    tx: value?.tx ?? 0,
    ty: value?.ty ?? 0,
  }
}

export function getPointFor(point: RawPointXY | undefined): SourcePointXY {
  const x = point?.x ?? 0
  const y = point?.y ?? 0
  return { x, y }
}
