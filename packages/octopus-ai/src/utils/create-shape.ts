/**
 * This file is taken from svg-exporter and slightly modified, the purpose of createShape() is
 * to generate  paper.Path based on Octopus shape.
 */
import { createPath, createPoint, createSegment } from './paper-factories.js'

import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

type PointType = 'point' | 'bezier'
export type OctopusPoint = {
  type: PointType
  coordinates: number[]
}

export type OctopusSubpath = { points: OctopusPoint[]; closed: boolean }

const isSubpathValid = (subPath: OctopusSubpath): boolean => {
  const points = subPath.points

  return Boolean(points.length)
}

const createPointSegment = (coords: number[]): paper.Point => {
  const [x, y] = coords
  return createPoint(x, y)
}

const createBezierSegment = (coords: number[]): paper.Segment => {
  const [x1, y1, x2, y2, x3, y3] = coords
  const anchor = createPoint(x3, y3)
  return createSegment(anchor, createPoint(x1, y1).subtract(anchor), createPoint(x2, y2).subtract(anchor))
}

const pointToSegment = (point: OctopusPoint): paper.Segment | paper.Point => {
  const segmentProcessors = {
    point: createPointSegment,
    bezier: createBezierSegment,
  }
  const pointType = point.type
  const coords = point.coordinates

  return segmentProcessors[pointType](coords)
}

const createSubpath = (subpath: OctopusSubpath): paper.Path => {
  const segments = subpath.points.map(pointToSegment)
  const shape = createPath(segments)
  return shape
}

export function createShape(subpath: OctopusSubpath): Nullish<paper.Path> {
  if (!isSubpathValid(subpath)) {
    return null
  }

  const shape = createSubpath(subpath)

  if (!shape) {
    return null
  }

  if (subpath.closed) {
    shape.closePath()
  }

  return shape
}
