import { at, get } from 'lodash'
import paper from 'paper'

import type { RawBounds } from '../typings/source'
import { asNumber } from './as'

paper.setup(new paper.Size(640, 480)) // TODO why?

export function createPoint(x: number, y: number): paper.Point {
  return new paper.Point(x, y)
}

export function createSize(width: number, height?: number): paper.Size {
  return new paper.Size(width, height === undefined ? width : height)
}

export function createRectangleFromPointSize(point: paper.Point, size: paper.Size): paper.Rectangle {
  return new paper.Rectangle(point, size)
}

export function createRectangleFromBounds(bounds: RawBounds): paper.Rectangle {
  const left = asNumber(bounds?.left, 0)
  const top = asNumber(bounds?.top, 0)
  const width = asNumber(bounds?.right, 0) - left
  const height = asNumber(bounds?.bottom, 0) - top
  return createRectangleFromPointSize(createPoint(left, top), createSize(width, height))
}

export function createSegment(point: paper.Point, handleIn?: paper.Point, handleOut?: paper.Point): paper.Segment {
  return new paper.Segment(point, handleIn, handleOut)
}

export function createPath(options: Object | Array<paper.Segment>): paper.Path {
  return new paper.Path(options)
}

export function createPathRectangle(bounds: RawBounds): paper.Path {
  return new paper.Path.Rectangle(createRectangleFromBounds(bounds))
}

export function paperBounds(any: paper.Path): RawBounds {
  const props = ['x', 'y', 'width', 'height']
  const [x, y, width, height] = at(get(any, 'bounds'), props)
  return { left: x, top: y, right: x + width, bottom: y + height }
}

export function createGroup(...paths: Array<paper.Path>): paper.Group {
  return new paper.Group(paths)
}
