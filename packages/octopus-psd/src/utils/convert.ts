import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'
import { UnitFloatType } from '@webtoon/psd-ts'

import { DEFAULTS } from './defaults.js'

import type { Octopus } from '../typings/octopus'
import type { RawOffset } from '../typings/raw'
import type { SourceBounds, SourceColor, SourceVectorXY } from '../typings/source'

//todo check blendmodes and if key is trime
const BLEND_MODES: { [key: string]: Octopus['BlendMode'] } = {
  fdiv: 'DIVIDE',
  fsub: 'SUBTRACT',
  colr: 'COLOR',
  idiv: 'COLOR_BURN',
  'div ': 'COLOR_DODGE',
  dark: 'DARKEN',
  dkCl: 'DARKER_COLOR',
  diff: 'DIFFERENCE',
  smud: 'EXCLUSION',
  hLit: 'HARD_LIGHT',
  hMix: 'HARD_MIX',
  'hue ': 'HUE',
  lite: 'LIGHTEN',
  lgCl: 'LIGHTER_COLOR',
  lbrn: 'LINEAR_BURN',
  lddg: 'LINEAR_DODGE',
  lLit: 'LINEAR_LIGHT',
  'lum ': 'LUMINOSITY',
  'mul ': 'MULTIPLY',
  norm: 'NORMAL',
  over: 'OVERLAY',
  pass: 'PASS_THROUGH',
  pLit: 'PIN_LIGHT',
  'sat ': 'SATURATION',
  scrn: 'SCREEN',
  sLit: 'SOFT_LIGHT',
  vLit: 'VIVID_LIGHT',
  Nrml: 'NORMAL',
  CBrn: 'COLOR_BURN',
  CDdg: 'COLOR_DODGE',
  'Clr ': 'COLOR',
  Dfrn: 'DIFFERENCE',
  Drkn: 'DARKEN',
  // Dslv: 'dissolve', // no such type in OCTOPUS
  'H   ': 'HUE',
  HrdL: 'HARD_LIGHT',
  Lghn: 'LIGHTEN',
  Lmns: 'LUMINOSITY',
  Ovrl: 'OVERLAY',
  SftL: 'SOFT_LIGHT',
  Strt: 'SATURATION',
  Xclu: 'EXCLUSION',
  blendDivide: 'DIVIDE',
  blendSubtraction: 'SUBTRACT',
  darkerColor: 'DARKER_COLOR',
  hardMix: 'HARD_MIX',
  lighterColor: 'LIGHTER_COLOR',
  linearBurn: 'LINEAR_BURN',
  linearDodge: 'LINEAR_DODGE',
  linearLight: 'LINEAR_LIGHT',
  Mltp: 'MULTIPLY',
  pinLight: 'PIN_LIGHT',
  Scrn: 'SCREEN',
  vividLight: 'VIVID_LIGHT',
}

export function convertBlendMode(blendMode?: string): Octopus['BlendMode'] {
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

export function convertOffset(offset: RawOffset, width: number, height: number): SourceVectorXY {
  const { Hrzn: horizontal, Vrtc: vertical } = offset

  if (typeof horizontal === 'number' || typeof vertical === 'number') {
    return {
      x: typeof vertical === 'number' ? 0 : vertical.value,
      y: typeof horizontal === 'number' ? 0 : horizontal.value,
    }
  }

  const { value: horizontalValue, unitType: horizontalType } = horizontal
  const { value: verticalValue, unitType: verticalType } = vertical

  if (horizontalType !== UnitFloatType.Percent && verticalType !== UnitFloatType.Percent) {
    return { x: horizontalValue, y: verticalValue }
  }

  if (horizontalType !== UnitFloatType.Percent || verticalType !== UnitFloatType.Percent) {
    return { x: 0, y: 0 }
  }

  if (typeof horizontalValue === 'undefined' || typeof verticalValue === 'undefined') {
    return { x: 0, y: 0 }
  }

  const x = (horizontalValue * width) / 100
  const y = (verticalValue * height) / 100

  return { x, y }
}

export function convertRectangle(bounds: SourceBounds | undefined): Octopus['Rectangle'] {
  const x0 = bounds?.left ?? 0
  const x1 = bounds?.right ?? 0
  const y0 = bounds?.top ?? 0
  const y1 = bounds?.bottom ?? 0
  return { x0, x1, y0, y1 }
}
