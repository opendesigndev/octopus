/**
 * This file is taken from: https://gitlab.avcd.cz/avocode/node-sketch-writer/-/blob/master/src/utils/create-shape.ts
 * It's slightly modified to generate paper.PathItem from given RawPathComponent and return it's pathData.
 */

import { createPath, createPoint, createSegment, createTranslationMatrix } from './paper-factories'
import type { RawSubpath, RawPathComponent, RawSubpathPoint, RawPointXY } from '../typings/source'

const createPointSegment = (anchor: RawPointXY | undefined): paper.Segment => {
  const x = anchor?.x ?? 0
  const y = anchor?.y ?? 0
  return createSegment(createPoint(x, y))
}

const createBezierSegment = (point: RawSubpathPoint): paper.Segment => {
  const x = point.anchor?.x ?? 0
  const y = point.anchor?.y ?? 0
  const inX = point.backward?.x ?? 0
  const inY = point.backward?.y ?? 0
  const outX = point.forward?.x ?? 0
  const outY = point.forward?.y ?? 0
  const anchor = createPoint(x, y)
  return createSegment(anchor, createPoint(inX, inY).subtract(anchor), createPoint(outX, outY).subtract(anchor))
}

const pointToSegment = (point: RawSubpathPoint): paper.Segment => {
  if (point.forward || point.backward) return createBezierSegment(point)
  return createPointSegment(point.anchor)
}

const subtractLayerTranslation = (segment: paper.Segment, [tx, ty]: [number, number]) => {
  const translationMatrix = createTranslationMatrix(-tx, -ty)
  segment.transform(translationMatrix)
  return segment
}

const createSubpath = (subpath: RawSubpath, layerTranslation: [number, number]): paper.PathItem => {
  const points = subpath.points ?? []
  const segments = points.map(pointToSegment).map((segment) => subtractLayerTranslation(segment, layerTranslation))
  const shape = createPath(segments)
  shape.closed = subpath.closedSubpath ?? false
  return shape
}

const processSubpaths = (subpaths: RawSubpath[], layerTranslation: [number, number]): paper.PathItem | null => {
  const subpathEntities = subpaths
    .filter((subpath) => (subpath.points?.length ?? 0) > 1)
    .map((subpath: RawSubpath) => createSubpath(subpath, layerTranslation))

  if (!subpathEntities.length) return null
  return subpathEntities.reduce((prev: paper.PathItem, current: paper.PathItem): paper.PathItem => {
    prev.closePath()
    current.closePath()
    return prev.exclude(current)
  })
}

export function createPathData(pathComponent: RawPathComponent, layerTranslation: [number, number]): string {
  const subpaths = pathComponent?.subpathListKey ?? []
  const pathItem = processSubpaths(subpaths, layerTranslation)
  return pathItem?.pathData ?? ''
}
