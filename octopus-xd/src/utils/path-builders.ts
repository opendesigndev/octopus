import {
  createPathCircle,
  createPathEllipse,
  createPathRectangle,
  createPathLine,
  createPoint,
  createSize,
  createPath
} from './paper'

import { asArray, asNumber } from './as'

import type {
  RawShape,
  RawShapeCircle,
  RawShapeCompound,
  RawShapeEllipse,
  RawShapeLine,
  RawShapePath,
  RawShapePolygon,
  RawShapeRect
} from '../typings/source'


function buildShapePathFromRect(shape: RawShapeRect): string | null {
  return createPathRectangle(
    createPoint(
      asNumber(shape?.x),
      asNumber(shape?.y)
    ),
    createSize(
      asNumber(shape?.width),
      asNumber(shape?.height)
    )
  ).pathData
}

function buildShapePathFromEllipse(shape: RawShapeEllipse): string {
  return createPathEllipse(
    createPoint(0, 0),
    createSize(
      asNumber(shape?.rx) * 2,
      asNumber(shape?.ry) * 2
    )
  ).pathData
}

function buildShapePathFromPolygon(shape: RawShapePolygon): string {
  const polygonPath = `M${
    asArray(shape?.points).map(p => `${asNumber(p?.x)} ${asNumber(p?.y)}`).join('L')
  }Z`
  return createPath(polygonPath).pathData
}

function buildShapePathFromLine(shape: RawShapeLine): string {
  return createPathLine(
    createPoint(asNumber(shape?.x1), asNumber(shape?.y1)),
    createPoint(asNumber(shape?.x2), asNumber(shape?.y2))
  ).pathData
}

function buildShapePathFromCircle(shape: RawShapeCircle): string {
  return createPathCircle(
    createPoint(asNumber(shape?.r), asNumber(shape?.r)),
    asNumber(shape?.r)
  ).pathData
}

export function buildShapePathFromCompound(shape: RawShapeCompound): string | null {
  return typeof shape?.path === 'string' ? shape?.path : null
}

export function buildShapePathFromPath(shape: RawShapePath): string | null {
  return typeof shape?.path === 'string' ? shape?.path : null
}

export function buildShapePath(shape: RawShape): string | null {
  const type = shape?.type
  
  switch (type) {
    case 'compound': {
      return buildShapePathFromCompound(shape)
    }
    case 'path': {
      return buildShapePathFromPath(shape)
    }
    case 'rect': {
      return buildShapePathFromRect(shape)
    }
    case 'ellipse': {
      return buildShapePathFromEllipse(shape)
    }
    case 'circle': {
      return buildShapePathFromCircle(shape)
    }
    case 'line': {
      return buildShapePathFromLine(shape)
    }
    case 'polygon': {
      return buildShapePathFromPolygon(shape)
    }
  }

  return null
}

export function buildShapePathSafe(shape: RawShape | undefined): string {
  const defaultPath = 'M0 0Z'
  if (!shape) return defaultPath
  return buildShapePath(shape) || defaultPath
}
