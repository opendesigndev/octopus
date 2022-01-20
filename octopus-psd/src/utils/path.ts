import { DEFAULTS } from './defaults'

export function isRectangle(points: Array<{ x?: number; y?: number } | undefined>): boolean {
  const [topLeft, topRight, bottomRight, bottomLeft] = points
  const top = topLeft?.y === topRight?.y
  const bottom = bottomLeft?.y === bottomRight?.y
  const left = topLeft?.x === bottomLeft?.x
  const right = topRight?.x === bottomRight?.x
  return top && bottom && left && right
}

export function defaultTranslateMatrix(translate: [number, number] | undefined = [0, 0]) {
  const [xx, xy, yx, yy] = [...DEFAULTS.LAYER_TRANSFORM]
  return [xx, xy, yx, yy, ...translate]
}
