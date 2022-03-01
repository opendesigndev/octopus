import type { Octopus } from '../typings/octopus'
import type { RawBlendMode, RawColor } from '../typings/raw'
import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import type { SourceMatrix } from '../typings/source'
import { DEFAULTS } from './defaults'

const BLEND_MODES: { [key: string]: Octopus['BlendMode'] } = {
  blendDivide: 'DIVIDE',
  blendSubtraction: 'SUBTRACT',
  color: 'COLOR',
  colorBurn: 'COLOR_BURN',
  colorDodge: 'COLOR_DODGE',
  darken: 'DARKEN',
  darkerColor: 'DARKER_COLOR',
  difference: 'DIFFERENCE',
  dissolve: 'DISSOLVE',
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

export function convertOpacity(opacity: number | undefined): number {
  return asFiniteNumber(opacity, 100) / 100
}

export function convertScale(scale: number | undefined): number {
  return asFiniteNumber(scale, 100) / 100
}

export function convertColor(color: RawColor | null | undefined): Octopus['Color'] {
  return {
    r: asFiniteNumber(color?.red, 0) / 255,
    g: asFiniteNumber(color?.green, 0) / 255,
    b: asFiniteNumber(color?.blue, 0) / 255,
    a: 1,
  }
}

export function convertMatrix(matrix: SourceMatrix): Octopus['Transform'] {
  const { tx, ty, xx, xy, yx, yy } = matrix
  return [xx, xy, yx, yy, tx, ty]
}

export function pointsToPixels(points: number, dpi = 72): number {
  return asFiniteNumber(points / (72 / dpi), 0)
}
