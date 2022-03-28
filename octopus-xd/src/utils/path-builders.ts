import type paper from 'paper'

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

import { asNumber, asArray } from '@avocode/octopus-common/dist/utils/as'

import type {
  RawShape,
  RawShapeCircle,
  RawShapeCompound,
  RawShapeEllipse,
  RawShapeLine,
  RawShapePath,
  RawShapePolygon,
  RawShapeRect,
} from '../typings/source'

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
  return typeof shape?.path === 'string' ? createCompoundPath(shape?.path) : null
}

export function buildShapeFromPath(shape: RawShapePath): paper.CompoundPath | null {
  return typeof shape?.path === 'string' ? createCompoundPath(shape?.path) : null
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

export function buildShapePathSafe(shape: RawShape | undefined): paper.Path | paper.CompoundPath {
  const defaultShape = createPath('M0 0Z')

  if (!shape) return defaultShape
  const paperShape = buildShape(shape)
  return paperShape || defaultShape
}
