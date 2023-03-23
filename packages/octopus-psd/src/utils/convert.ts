import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'
import { UnitFloatType } from '@webtoon/psd-ts'

import BLEND_MODES from './blend-modes.js'
import { DEFAULTS } from './defaults.js'

import type { Octopus } from '../typings/octopus.js'
import type { RawOffset } from '../typings/raw/index.js'
import type { SourceBounds, SourceColor, SourceVectorXY } from '../typings/source.js'

export function convertBlendMode(blendMode: keyof typeof BLEND_MODES | undefined): Octopus['BlendMode'] {
  return typeof blendMode === 'string' && blendMode in BLEND_MODES
    ? BLEND_MODES[blendMode as keyof typeof BLEND_MODES]
    : DEFAULTS.BLEND_MODE
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
