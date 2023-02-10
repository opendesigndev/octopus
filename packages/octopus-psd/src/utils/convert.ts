import { asFiniteNumber } from '@opendesign/octopus-common/utils/as'
import { round } from '@opendesign/octopus-common/utils/math'

import { DEFAULTS } from './defaults'

import type { Octopus } from '../typings/octopus'
import type { RawBlendMode } from '../typings/raw/index'
import type { SourceBounds, SourceColor, SourceOffset, SourceVectorXY } from '../typings/source'

const BLEND_MODES: { [key: string]: Octopus['BlendMode'] } = {
  blendDivide: 'DIVIDE',
  blendSubtraction: 'SUBTRACT',
  color: 'COLOR',
  colorBurn: 'COLOR_BURN',
  colorDodge: 'COLOR_DODGE',
  darken: 'DARKEN',
  darkerColor: 'DARKER_COLOR',
  difference: 'DIFFERENCE',
  exclusion: 'EXCLUSION',
  hardLight: 'HARD_LIGHT',
  hardMix: 'HARD_MIX',
  hue: 'HUE',
  lighten: 'LIGHTEN',
  lighterColor: 'LIGHTER_COLOR',
  linearBurn: 'LINEAR_BURN',
  linearDodge: 'LINEAR_DODGE',
  linearLight: 'LINEAR_LIGHT',
  luminosity: 'LUMINOSITY',
  multiply: 'MULTIPLY',
  normal: 'NORMAL',
  overlay: 'OVERLAY',
  passThrough: 'PASS_THROUGH',
  pinLight: 'PIN_LIGHT',
  saturation: 'SATURATION',
  screen: 'SCREEN',
  softLight: 'SOFT_LIGHT',
  vividLight: 'VIVID_LIGHT',
}

export function convertBlendMode(blendMode?: RawBlendMode): Octopus['BlendMode'] {
  return typeof blendMode === 'string' && blendMode in BLEND_MODES ? BLEND_MODES[blendMode] : DEFAULTS.BLEND_MODE
}

export function convertColor(color: SourceColor | null | undefined, opacity?: number): Octopus['Color'] {
  return {
    r: round(asFiniteNumber(color?.r, 0) / 255, 4),
    g: round(asFiniteNumber(color?.g, 0) / 255, 4),
    b: round(asFiniteNumber(color?.b, 0) / 255, 4),
    a: round(opacity ?? 1, 4),
  }
}

export function convertOffset(offset: SourceOffset, width: number, height: number): SourceVectorXY {
  const { horizontal: h, vertical: v } = offset
  if (typeof h === 'number' && typeof v === 'number') return { x: h, y: v }
  if (typeof h === 'number' || typeof v === 'number') return { x: 0, y: 0 }
  if (h?.value !== undefined && v?.value !== undefined) {
    const x = (h.value * width) / 100
    const y = (v.value * height) / 100
    return { x, y }
  }
  return { x: 0, y: 0 }
}

export function convertRectangle(bounds: SourceBounds | undefined): Octopus['Rectangle'] {
  const x0 = bounds?.left ?? 0
  const x1 = bounds?.right ?? 0
  const y0 = bounds?.top ?? 0
  const y1 = bounds?.bottom ?? 0
  return { x0, x1, y0, y1 }
}
