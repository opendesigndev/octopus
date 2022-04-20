import { asNumber, asArray } from '@avocode/octopus-common/dist/utils/as'

import { convertObjectToPaperMatrix } from './matrix'
import {
  createPathCircle,
  createPathEllipse,
  createPathRectangle,
  createCompoundPath,
  createPathLine,
  createPoint,
  createSize,
  createPath,
} from './paper'

import type {
  Raw2DMatrix,
  RawShape,
  RawShapeCircle,
  RawShapeCompound,
  RawShapeEllipse,
  RawShapeLayer,
  RawShapeLine,
  RawShapePath,
  RawShapePolygon,
  RawShapeRect,
} from '../typings/source'
import type paper from 'paper'

function buildShapeFromRect(shape: RawShapeRect): paper.Path {
  return createPathRectangle(
    createPoint(asNumber(shape?.x), asNumber(shape?.y)),
    createSize(asNumber(shape?.width), asNumber(shape?.height))
  )
}

function buildShapeFromEllipse(shape: RawShapeEllipse): paper.Path {
  return createPathEllipse(createPoint(0, 0), createSize(asNumber(shape?.rx) * 2, asNumber(shape?.ry) * 2))
}

function buildShapeFromPolygon(shape: RawShapePolygon): paper.Path {
  const polygonPath = `M${asArray(shape?.points)
    .map((p) => `${asNumber(p?.x)} ${asNumber(p?.y)}`)
    .join('L')}Z`
  return createPath(polygonPath)
}

function buildShapeFromLine(shape: RawShapeLine): paper.Path {
  return createPathLine(
    createPoint(asNumber(shape?.x1), asNumber(shape?.y1)),
    createPoint(asNumber(shape?.x2), asNumber(shape?.y2))
  )
}

function buildShapeFromCircle(shape: RawShapeCircle): paper.Path {
  return createPathCircle(createPoint(asNumber(shape?.r), asNumber(shape?.r)), asNumber(shape?.r))
}

export function buildShapeFromCompound(shape: RawShapeCompound): paper.CompoundPath | null {
  if (typeof shape?.path !== 'string') return null
  const compound = createCompoundPath(shape?.path)
  /**
   * @TODO check if it's not a rendering bug.
   * We want to compile the whole compound tree to get the offset for gradient effect
   * */
  compound.data.united = buildCompoundTree(shape)
  return compound
}

export function buildShapeFromPath(shape: RawShapePath): paper.CompoundPath | null {
  return typeof shape?.path === 'string' ? createCompoundPath(shape?.path) : null
}

function buildCompoundTree(shape: RawShape): paper.Path | paper.CompoundPath | null {
  const compound = shape as RawShapeCompound
  const children = asArray(compound.children)
  if (!children.length) return null
  const subshapes = children
    .map((child) => buildShapeLayer(child))
    .filter((shape) => shape !== null) as paper.PathItem[]

  if (!subshapes.length) return null
  const compiled = subshapes.reduce((compiled, subshape) => compiled.unite(subshape))
  return compiled as paper.CompoundPath
}

function buildShapeLayer(shapeLayer: RawShapeLayer) {
  if (!shapeLayer.shape) return null
  const shapeRaw = buildShape(shapeLayer.shape)
  const shape = shapeRaw?.data.united || shapeRaw
  shape?.transform(convertObjectToPaperMatrix(shapeLayer.transform as Raw2DMatrix))
  return shape
}

export function buildShape(shape: RawShape): paper.Path | paper.CompoundPath | null {
  const type = shape?.type

  switch (type) {
    case 'compound': {
      return buildShapeFromCompound(shape)
    }
    case 'path': {
      return buildShapeFromPath(shape)
    }
    case 'rect': {
      return buildShapeFromRect(shape)
    }
    case 'ellipse': {
      return buildShapeFromEllipse(shape)
    }
    case 'circle': {
      return buildShapeFromCircle(shape)
    }
    case 'line': {
      return buildShapeFromLine(shape)
    }
    case 'polygon': {
      return buildShapeFromPolygon(shape)
    }
  }

  return null
}

function getCompilationOffset(shape: paper.Path | paper.CompoundPath): { x: number; y: number } {
  if (!shape.data.united) return { x: 0, y: 0 }
  return {
    x: shape.data.united.bounds.x - shape.bounds.x,
    y: shape.data.united.bounds.y - shape.bounds.y,
  }
}

function normalizeShape(shape: paper.Path | paper.CompoundPath) {
  const offsetBase = shape.data.united || shape
  const offsetX = offsetBase.bounds.left
  const offsetY = offsetBase.bounds.top
  shape.bounds.left = 0
  shape.bounds.top = 0
  return { shape, offset: { x: offsetX, y: offsetY } }
}

export function buildShapePathSafe(shape: RawShape | undefined): {
  shape: paper.Path | paper.CompoundPath
  normalizationOffset: { x: number; y: number }
  compilationOffset: { x: number; y: number }
} {
  const defaultShape = {
    shape: createPath('M0 0Z'),
    normalizationOffset: { x: 0, y: 0 },
    compilationOffset: { x: 0, y: 0 },
  }

  if (!shape) return defaultShape
  const paperShape = buildShape(shape)

  if (!paperShape) return defaultShape

  /**
   * @TODO doublecheck how compiled path from source looks like when children are bugged.
   * We want to skip offset normalization for compound paths because compound paths has its own offsets too.
   */
  if (shape.type === 'compound') {
    const normalizationOffset = { x: 0, y: 0 }
    const compilationOffset = getCompilationOffset(paperShape)
    return {
      shape: paperShape,
      normalizationOffset,
      compilationOffset,
    }
  }

  /**
   * Normalize path and save normalized offset values for compensation using matrices.
   */

  const { shape: normalizedShape, offset: normalizationOffset } = normalizeShape(paperShape)
  const compilationOffset = { x: 0, y: 0 }

  return {
    shape: normalizedShape,
    normalizationOffset,
    compilationOffset,
  }
}
