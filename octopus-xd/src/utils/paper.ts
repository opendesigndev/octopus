import type paper from 'paper'

const Paper = require('paper')
const { CompoundPath, Curve, Path, Point, Segment, Size, Rectangle, Matrix, Group } = Paper


Paper.setup(new Size(640, 480))

export function createSize(width: number, height?: number): paper.Size {
  return new Size(
    width,
    height === undefined ? width : height
  )
}
export function createPoint(x: number, y: number): paper.Point {
  return new Point(x, y)
}
export function createRectangleFromPointSize(point: paper.Point, size: paper.Size): paper.Rectangle {
  return new Rectangle(point, size)
}
export function createSegment(
  point: paper.Point,
  handleIn?: paper.Point,
  handleOut?: paper.Point
): paper.Segment {
  return new Segment(point, handleIn, handleOut)
}
export function createSegmentI(point: paper.Point, handleIn: paper.Point) {
  return createSegment(point, handleIn)
}
export function createSegmentO(point: paper.Point, handleOut: paper.Point) {
  return createSegment(point, undefined, handleOut)
}
export function createPath(options: Object | paper.Segment[]): paper.Path {
  return new Path(options)
}
export function createPathRectangle(point: paper.Point, size: paper.Size): paper.Path.Rectangle {
  return new Path.Rectangle(point, size)
}
export function createPathEllipse(point: paper.Point, size: paper.Size): paper.Path.Ellipse {
  return new Path.Ellipse(new Rectangle(point, size))
}
export function createPathCircle(center: paper.Point, radius: number): paper.Path.Circle {
  return new Path.Circle(center, radius)
}
export function createPathLine(from: paper.Point, to: paper.Point): paper.Path.Line {
  return new Path.Line(from, to)
}
export function createCompoundPath(options: string | Object): paper.CompoundPath {
  return new CompoundPath(typeof options === 'string' ? { pathData: options } : options)
}
export function createMatrix(a: number, b: number, c: number, d: number, tx: number, ty: number) {
  return new Matrix(a, b, c, d, tx, ty)
}
export function createGroup(paths: paper.Item[]): paper.Group {
  return new Group(paths)
}
export function createCurve(seg1: paper.Segment, seg2: paper.Segment): paper.Curve {
  return new Curve(seg1, seg2)
}
export function flattenGroup(group: paper.Group | paper.Item): paper.Item[] {
  return group instanceof Group
    ? [ group, ...group.children.reduce((acc: paper.Item[], child: paper.Item) => {
      return [ ...acc, ...flattenGroup(child) ]
    }, []) ]
    : [ group as paper.Item ]
}

export type {
  CompoundPath,
  Curve,
  Path,
  Point,
  Segment,
  Size,
  Rectangle,
  Matrix,
  Group
}
