import paper from 'paper'

paper.setup(new paper.Size(0, 0))

export function createPoint(x: number, y: number): paper.Point {
  return new paper.Point(x, y)
}

export function createSegment(point: paper.Point, handleIn?: paper.Point, handleOut?: paper.Point): paper.Segment {
  return new paper.Segment(point, handleIn, handleOut)
}

export function createPath(options: Object | Array<paper.Segment>): paper.Path {
  return new paper.Path(options)
}

export function createTranslationMatrix(tx: number, ty: number): paper.Matrix {
  return new paper.Matrix(1, 0, 0, 1, tx, ty)
}

export function createMatrix(a: number, b: number, c: number, d: number, tx: number, ty: number): paper.Matrix {
  return new paper.Matrix(a, b, c, d, tx, ty)
}
