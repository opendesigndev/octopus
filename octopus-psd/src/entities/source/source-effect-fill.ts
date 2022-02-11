import type { RawFill, RawFillGradient, RawShapeGradientColors } from '../../typings/source'
import { getColorFor } from './utils'

export type SourceShapeGradientColor = ReturnType<typeof convertRawShapeGradientColor>
function convertRawShapeGradientColor(gradient: RawShapeGradientColors | undefined) {
  const colors = getColorFor(gradient?.color)
  const location = gradient?.location || 0
  return { ...gradient, colors, location }
}

export type SourceShapeGradient = ReturnType<typeof convertRawShapeGradient>
function convertRawShapeGradient(gradient: RawFillGradient | undefined) {
  const colors = gradient?.colors?.map(convertRawShapeGradientColor)
  return { ...gradient, colors }
}

export type SourceShapeFill = ReturnType<typeof convertRawShapeFill>
export function convertRawShapeFill(fill: RawFill | undefined) {
  const color = getColorFor(fill?.color)
  const gradient = fill?.gradient ? convertRawShapeGradient(fill?.gradient) : undefined
  const reverse = fill?.reverse ?? false
  const align = fill?.align ?? true
  const scale = (fill?.scale?.value ?? 100) / 100
  const angle = fill?.Angl?.value ?? fill?.angle?.value ?? 0
  return { ...fill, color, gradient, reverse, scale, angle, align }
}

export class SourceEffectFill {}
