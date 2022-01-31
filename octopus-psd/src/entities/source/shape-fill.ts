import type { RawShapeFill, RawShapeGradient, RawShapeGradientColors } from '../../typings/source'
import { getColorFor } from './utils'

export type SourceShapeGradientColor = ReturnType<typeof mapShapeGradientColor>
function mapShapeGradientColor(gradient: RawShapeGradientColors | undefined) {
  const colors = getColorFor(gradient?.color)
  const location = gradient?.location || 0
  return { ...gradient, colors, location }
}

export type SourceShapeGradient = ReturnType<typeof mapShapeGradient>
function mapShapeGradient(gradient: RawShapeGradient | undefined) {
  const colors = gradient?.colors?.map(mapShapeGradientColor)
  return { ...gradient, colors }
}

export type SourceShapeFill = ReturnType<typeof mapShapeFill>
export function mapShapeFill(fill: RawShapeFill | undefined) {
  const color = getColorFor(fill?.color)
  const gradient = mapShapeGradient(fill?.gradient)
  return { ...fill, color, gradient }
}
