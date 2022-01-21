import { DEFAULTS } from './defaults'

export function isRectangle(points: Array<{ x?: number; y?: number } | undefined>): boolean {
  const [topLeft, topRight, bottomRight, bottomLeft] = points
  const top = topLeft?.y === topRight?.y
  const bottom = bottomLeft?.y === bottomRight?.y
  const left = topLeft?.x === bottomLeft?.x
  const right = topRight?.x === bottomRight?.x
  return top && bottom && left && right
}

export function isRoundedRectangle(points: Array<{ x?: number; y?: number } | undefined>): boolean {
  const [
    topLeftTop,
    topRightTop,
    topRightRight,
    bottomRightRight,
    bottomRightBottom,
    bottomLeftBottom,
    bottomLeftLeft,
    topLeftLeft,
  ] = points
  const top = topLeftLeft?.y === topRightRight?.y && topLeftTop?.y === topRightTop?.y
  const bottom = bottomLeftLeft?.y === bottomRightRight?.y && bottomLeftBottom?.y === bottomRightBottom?.y
  const left = topLeftLeft?.x === bottomLeftLeft?.x && topLeftTop?.x === bottomLeftBottom?.x
  const right = topRightTop?.x === bottomRightBottom?.x && topRightRight?.x === bottomRightRight?.x
  return top && bottom && left && right
}

export function defaultTranslateMatrix(translate: [number, number] | undefined = [0, 0]) {
  const [xx, xy, yx, yy] = [...DEFAULTS.LAYER_TRANSFORM]
  return [xx, xy, yx, yy, ...translate]
}
