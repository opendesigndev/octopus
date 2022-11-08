import { DEFAULTS } from './defaults.js'

type Point = { x?: number; y?: number }
export type Points = (Point | undefined)[]

export function isRectangle(points: Points): boolean {
  if (points.length !== 4) return false
  const [topLeft, topRight, bottomRight, bottomLeft] = points
  const top = topLeft?.y === topRight?.y
  const bottom = bottomLeft?.y === bottomRight?.y
  const left = topLeft?.x === bottomLeft?.x
  const right = topRight?.x === bottomRight?.x
  return top && bottom && left && right
}

/**
 *     tlt -- trt
 *   tll        trr
 *   |            |
 *   |            |
 *   bll        brr
 *     blb -- brb
 */
export function isRoundedRectangle(points: Points): boolean {
  if (points.length !== 8) return false
  const [tlt, trt, trr, brr, brb, blb, bll, tll] = points
  const top = tll?.y === trr?.y && tlt?.y === trt?.y
  const bottom = bll?.y === brr?.y && blb?.y === brb?.y
  const left = tll?.x === bll?.x && tlt?.x === blb?.x
  const right = trt?.x === brb?.x && trr?.x === brr?.x
  return top && bottom && left && right
}

export function createDefaultTranslationMatrix(translate: readonly [number, number] | undefined = [0, 0]): number[] {
  const [xx, xy, yx, yy] = [...DEFAULTS.LAYER_TRANSFORM]
  return [xx, xy, yx, yy, ...translate]
}
