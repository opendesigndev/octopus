import { asFiniteNumber } from '@avocode/octopus-common/dist/utils/as'
import { round } from '@avocode/octopus-common/dist/utils/math'

import { DEFAULTS } from './defaults'

import type { SourceArtboard } from '../entities/source/source-artboard'
import type { SourceLayerFrame } from '../entities/source/source-layer-frame'
import type { Octopus } from '../typings/octopus'
import type { RawBoundingBox, RawGeometry, RawVector, RawTransform, RawWindingRule } from '../typings/raw'
import type { SourceBounds, SourceGeometry, SourceTransform } from '../typings/source'

export function getBoundsFor(value: RawBoundingBox | undefined): SourceBounds | null {
  if (value?.x === undefined && value?.y === undefined && value?.width === undefined && value?.height === undefined)
    return null
  const x = round(asFiniteNumber(value?.x, 0))
  const y = round(asFiniteNumber(value?.y, 0))
  const width = round(asFiniteNumber(value?.width, 0))
  const height = round(asFiniteNumber(value?.height, 0))
  return { x, y, width, height }
}

export function getSizeFor(value: RawVector | undefined): Octopus['Vec2'] | null {
  if (value?.x === undefined && value?.y === undefined) return null
  const x = round(asFiniteNumber(value?.x, 0))
  const y = round(asFiniteNumber(value?.y, 0))
  return { x, y }
}

export function getTransformFor(value: RawTransform | undefined): SourceTransform | null {
  const [m1, m2] = value ?? []
  if (!Array.isArray(m1) || !Array.isArray(m2)) return null
  const [a, c, tx] = m1
  const [b, d, ty] = m2
  return [a, b, c, d, tx, ty]
}

function getFillRule(rule: RawWindingRule | undefined): Octopus['FillRule'] {
  return rule === 'EVENODD' ? 'EVEN_ODD' : 'NON_ZERO'
}

export function getGeometryFor(values: RawGeometry[] = []): SourceGeometry[] {
  return values.map((value) => ({
    path: value.path ?? DEFAULTS.EMPTY_PATH,
    fillRule: getFillRule(value.windingRule),
  }))
}

export function getRole(source: SourceArtboard): 'ARTBOARD' | 'COMPONENT' | 'PASTEBOARD' {
  if (source.isPasteboard) return 'PASTEBOARD'
  if (source.sourceFrame.type === 'COMPONENT') return 'COMPONENT'
  return 'ARTBOARD'
}

export function getArtboardTransform(sourceLayer: SourceLayerFrame): number[] | undefined {
  const bounds = sourceLayer.bounds
  const boundingBox = sourceLayer.boundingBox
  if (!bounds || !boundingBox) return undefined
  const { x: x0, y: y0 } = bounds
  const { x: x1, y: y1 } = boundingBox
  return [1, 0, 0, 1, x1 - x0, y1 - y0]
}
