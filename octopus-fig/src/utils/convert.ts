import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { round } from '@avocode/octopus-common/dist/utils/math'

import { DEFAULTS } from './defaults'

import type { Octopus } from '../typings/octopus'
import type { RawBlendMode, RawColor } from '../typings/raw'

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

export function convertBlendMode(blendMode?: RawBlendMode): Octopus['BlendMode'] {
  return typeof blendMode === 'string' && blendMode in BLEND_MODES ? blendMode : DEFAULTS.BLEND_MODE
}

export function convertColor(color: RawColor | undefined, opacity = 1): Octopus['Color'] {
  const finalOpacity = asFiniteNumber(color?.a, 1) * opacity
  return {
    r: round(asFiniteNumber(color?.r, 0), 4),
    g: round(asFiniteNumber(color?.g, 0), 4),
    b: round(asFiniteNumber(color?.b, 0), 4),
    a: round(finalOpacity, 4),
  }
}
