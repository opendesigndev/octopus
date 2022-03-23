/**
 * This file is taken from: https://gitlab.avcd.cz/avocode/node-sketch-writer/-/blob/master/src/utils/create-shape.ts
 * It's slightly modified to generate paper.PathItem from given SourcePathComponent and return it's pathData.
 */

import { createPath, createPoint, createSegment, createTranslationMatrix } from './paper-factories'
import type { SourcePathComponent } from '../entities/source/source-path-component'
import type { SourcePointXY } from '../typings/source'
import type { SourceSubpath } from '../entities/source/source-subpath'
import type { SourceSubpathPoint } from '../entities/source/source-subpath-point'
import { logError } from '../services/instances/misc'

const createPointSegment = ({ x, y }: SourcePointXY): paper.Segment => {
  return createSegment(createPoint(x, y))
}

const createBezierSegment = (point: SourceSubpathPoint): paper.Segment => {
  const { x, y } = point.anchor
  const { x: inX, y: inY } = point.backward ?? { x: 0, y: 0 }
  const { x: outX, y: outY } = point.forward ?? { x: 0, y: 0 }
  const anchor = createPoint(x, y)
  return createSegment(anchor, createPoint(inX, inY).subtract(anchor), createPoint(outX, outY).subtract(anchor))
}

const pointToSegment = (point: SourceSubpathPoint): paper.Segment => {
  if (point.forward || point.backward) return createBezierSegment(point)
  return createPointSegment(point.anchor)
}

const subtractLayerTranslation = (segment: paper.Segment, [tx, ty]: [number, number]) => {
  const translationMatrix = createTranslationMatrix(-tx, -ty)
  segment.transform(translationMatrix)
  return segment
}

const createSubpath = (subpath: SourceSubpath, layerTranslation: [number, number]): paper.PathItem => {
  const segments = subpath.points
    .map(pointToSegment)
    .map((segment) => subtractLayerTranslation(segment, layerTranslation))
  const shape = createPath(segments)
  shape.closed = subpath.closedSubpath
  return shape
}

const processSubpaths = (subpaths: SourceSubpath[], layerTranslation: [number, number]): paper.PathItem | null => {
  try {
    const subpathEntities = subpaths
      .filter((subpath) => subpath?.points?.length > 1)
      .map((subpath: SourceSubpath) => createSubpath(subpath, layerTranslation))
    if (!subpathEntities.length) return null
    return subpathEntities.reduce((prev, current): paper.PathItem => {
      prev.closePath()
      current.closePath()
      return prev?.exclude(current)
    })
  } catch (error) {
    logError('PathData: processSubpaths failed', error)
    return null
  }
}

export function createPathData(pathComponent: SourcePathComponent, layerTranslation: [number, number]): string {
  const pathItem = processSubpaths(pathComponent?.subpathListKey, layerTranslation)
  return pathItem?.pathData || 'MZ'
}
