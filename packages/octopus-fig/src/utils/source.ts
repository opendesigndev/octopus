import { asFiniteNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { isFiniteNumber } from '@opendesign/octopus-common/dist/utils/common.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import { DEFAULTS } from './defaults.js'
import { env } from '../services/index.js'

import type { SourceArtboard } from '../entities/source/source-artboard.js'
import type { SourceLayerContainer } from '../entities/source/source-layer-container.js'
import type { SourceLayer } from '../factories/create-source-layer.js'
import type { Octopus } from '../typings/octopus.js'
import type {
  RawBoundingBox,
  RawGeometry,
  RawVector,
  RawTransform,
  RawWindingRule,
  RawColor,
} from '../typings/raw/index.js'
import type { SourceBounds, SourceColor, SourceGeometry, SourceTransform } from '../typings/source.js'

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
  if (!isFiniteNumber(value?.x) || !isFiniteNumber(value?.y)) return null
  const x = round(asFiniteNumber(value?.x, 0))
  const y = round(asFiniteNumber(value?.y, 0))
  return { x, y }
}

export function getTransformFor(value: RawTransform | undefined): SourceTransform | null {
  const [m1, m2] = value ?? []
  if (!Array.isArray(m1) || !Array.isArray(m2)) return null
  const [a, c, tx] = m1
  const [b, d, ty] = m2
  const result: SourceTransform = [a, b, c, d, tx, ty]
  if (result.some((item) => !isFiniteNumber(item))) return null
  return result
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

export function getRole(source: SourceArtboard): 'ARTBOARD' | 'COMPONENT' | 'PASTEBOARD' | 'PARTIAL' {
  if (source.isPasteboard) return 'PASTEBOARD'
  if (source.sourceLayer.type === 'COMPONENT') return 'COMPONENT'
  if (source.parentType && source.parentType !== 'PAGE') return 'PARTIAL'
  return 'ARTBOARD'
}

export function getColorFor(color: RawColor | undefined): SourceColor | undefined {
  const { r, g, b, a: rawA } = color ?? {}
  if (r === undefined || g === undefined || b === undefined) return undefined
  const a = rawA === undefined ? 1 : rawA
  return { r, g, b, a }
}

export function hasParentBoolOp(sourceLayer: SourceLayer): boolean {
  return sourceLayer.parent.type === 'SHAPE' && sourceLayer.parent.shapeType === 'BOOLEAN_OPERATION'
}

export function getTopComponentTransform(sourceLayer: SourceLayerContainer): number[] | undefined {
  if (env.NODE_ENV !== 'debug') return undefined // TODO remove whole method when ISSUE is fixed https://github.com/opendesigndev/open-design-engine/issues/54
  const bounds = sourceLayer.bounds
  const boundingBox = sourceLayer.boundingBox
  if (!bounds || !boundingBox) return undefined
  const { x: x0, y: y0 } = bounds
  const { x: x1, y: y1 } = boundingBox
  return [1, 0, 0, 1, x1 - x0, y1 - y0]
}
