import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as'
import { round } from '@opendesign/octopus-common/dist/utils/math'

import { DEFAULTS } from './defaults'
import { createMatrix } from './paper'

import type { Octopus } from '../typings/octopus'
import type { RawBlendMode, RawColor, RawStop } from '../typings/raw'
import type { SourceTransform, SourceVector, SourceGradientPositions } from '../typings/source'

const BLEND_MODES: Octopus['BlendMode'][] = [
  'COLOR',
  'COLOR_BURN',
  'COLOR_DODGE',
  'DARKEN',
  'DIFFERENCE',
  'EXCLUSION',
  'HARD_LIGHT',
  'HUE',
  'LIGHTEN',
  'LINEAR_BURN',
  'LINEAR_DODGE',
  'LUMINOSITY',
  'MULTIPLY',
  'NORMAL',
  'OVERLAY',
  'PASS_THROUGH',
  'SATURATION',
  'SCREEN',
  'SOFT_LIGHT',
]

export function convertId(id: string): string {
  return id.replaceAll(':', '-').replaceAll(';', '_')
}

export function convertBlendMode(blendMode?: RawBlendMode): Octopus['BlendMode'] {
  return typeof blendMode === 'string' && BLEND_MODES.includes(blendMode) ? blendMode : DEFAULTS.BLEND_MODE
}

export function convertLayerBlendMode(
  blendMode: RawBlendMode | undefined,
  { isFrameLike = false }: { isFrameLike?: boolean }
): Octopus['BlendMode'] {
  if (!isFrameLike && blendMode === 'PASS_THROUGH') return DEFAULTS.BLEND_MODE // Figma issue, 'PASS_THROUGH' does not make sense on end layers.
  return convertBlendMode(blendMode)
}

export function convertColor(color: RawColor | undefined, opacity = 1): Octopus['Color'] {
  const finalOpacity = asFiniteNumber(color?.a, 0) * opacity
  return {
    r: round(asFiniteNumber(color?.r, 0), 4),
    g: round(asFiniteNumber(color?.g, 0), 4),
    b: round(asFiniteNumber(color?.b, 0), 4),
    a: round(finalOpacity, 4),
  }
}

export function convertStop(stop?: RawStop, opacity = 1): Octopus['GradientColorStop'] | null {
  if (stop?.color === undefined || stop?.position === undefined) return null
  return {
    color: convertColor(stop.color, opacity),
    position: stop.position,
  }
}

export function convertRectangle({ x, y }: SourceVector): Octopus['Rectangle'] {
  return { x0: 0, x1: x, y0: 0, y1: y }
}

export function convertLinearGradientTransform(
  gradientTransform: SourceTransform,
  width: number,
  height: number
): number[] {
  return createMatrix(gradientTransform)
    .scale(1 / width, 1 / height)
    .invert()
    .values.map((value) => round(value, 4))
}

export function convertRadialGradientTransform(
  gradientTransform: SourceTransform,
  width: number,
  height: number
): number[] {
  return createMatrix(gradientTransform)
    .invert()
    .translate(1 / 2, 1 / 2)
    .prepend(createMatrix([width, 0, 0, height, 0, 0]))
    .scale(1 / 2)
    .values.map((value) => round(value, 4))
}

export function convertGradientPositions(
  positions: SourceGradientPositions | null,
  width: number,
  height: number
): number[] | null {
  if (positions === null) return null
  const [P1, P2, P3] = positions
  const p1 = { x: P1.x * width, y: P1.y * height }
  const p2 = { x: P2.x * width, y: P2.y * height }
  const p3 = { x: P3.x * width, y: P3.y * height }

  const scaleX = p2.x - p1.x
  const skewY = p2.y - p1.y
  const skewX = p3.x - p1.x
  const scaleY = p3.y - p1.y
  const tx = p1.x
  const ty = p1.y
  const transform = [scaleX, skewY, skewX, scaleY, tx, ty]
  return transform.map((value) => round(value, 4))
}
