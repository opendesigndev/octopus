import type { RawShapeFill } from '../../typings/source'
import { getColorFor } from './utils'

export type SourceShapeFill = ReturnType<typeof mapShapeFill>
export function mapShapeFill(fill: RawShapeFill | undefined) {
  const color = getColorFor(fill?.color)
  return { ...fill, color }
}
