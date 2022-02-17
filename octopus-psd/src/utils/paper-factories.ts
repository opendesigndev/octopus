import paper from 'paper'

const { Path, Point, Segment, Size, Rectangle, Raster, Matrix } = paper

paper.setup(new Size(0, 0))

export function createPoint(x: number, y: number): paper.Point {
  return new Point(x, y)
}

export function createSize(width: number, height?: number): paper.Size {
  return new Size(width, height === undefined ? width : height)
}

export function createSegment(point: paper.Point, handleIn?: paper.Point, handleOut?: paper.Point): paper.Segment {
  return new Segment(point, handleIn, handleOut)
}

export function createLine(from: paper.Point, to: paper.Point): paper.Path {
  return new Path.Line(from, to)
}

export function createPath(segments: Array<paper.Segment | paper.Point>): paper.Path {
  return new Path(segments)
}

export function createPathEllipse(point: paper.Point, size: paper.Size): paper.Path.Ellipse {
  return new Path.Ellipse(new Rectangle(point, size))
}

export function createTranslationMatrix(tx: number, ty: number): paper.Matrix {
  return new Matrix(1, 0, 0, 1, tx, ty)
}

export function createMatrix(a: number, b: number, c: number, d: number, tx: number, ty: number): paper.Matrix {
  return new Matrix(a, b, c, d, tx, ty)
}

export function createRaster(path: string): paper.Raster {
  return new Raster(path)
}
