import type { RawBounds, RawColor, RawMatrix } from '../../typings/source'

export function getBoundsFor(value: RawBounds | undefined) {
  return {
    right: value?.right ?? 0,
    left: value?.left ?? 0,
    bottom: value?.bottom ?? 0,
    top: value?.top ?? 0,
  }
}

export function getColorFor(value: RawColor | undefined) {
  return {
    blue: value?.blue ?? 0,
    green: value?.green ?? 0,
    red: value?.red ?? 0,
  }
}

export function getMatrixFor(value: RawMatrix | undefined) {
  return {
    xx: value?.xx ?? 0,
    xy: value?.xy ?? 0,
    yx: value?.yx ?? 0,
    yy: value?.yy ?? 0,
    tx: value?.tx ?? 0,
    ty: value?.ty ?? 0,
  }
}
