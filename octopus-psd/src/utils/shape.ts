export function isRectangle(points: Array<{ x?: number; y?: number } | undefined>): boolean {
  const [topLeft, topRight, bottomRight, bottomLeft] = points
  const top = topLeft?.y === topRight?.y
  const bottom = bottomLeft?.y === bottomRight?.y
  const left = topLeft?.x === bottomLeft?.x
  const right = topRight?.x === bottomRight?.x
  return top && bottom && left && right
}
