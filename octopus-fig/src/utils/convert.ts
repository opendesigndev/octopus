import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { round } from '@avocode/octopus-common/dist/utils/math'

import { DEFAULTS } from './defaults'

import type { Octopus } from '../typings/octopus'
import type { RawBlendMode, RawColor, RawStop } from '../typings/raw'
import type { SourceVector } from '../typings/source'

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
