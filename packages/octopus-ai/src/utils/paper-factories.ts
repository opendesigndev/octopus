import paper from 'paper'

paper.setup(new paper.Size(640, 480))

export function createPoint(x: number, y: number): paper.Point {
  return new paper.Point(x, y)
}

export function createSegment(point: paper.Point, handleIn: paper.Point, handleOut: paper.Point): paper.Segment {
  return new paper.Segment(point, handleIn, handleOut)
}

export function createPath(options: Record<string, unknown> | Array<paper.Segment | paper.Point>): paper.Path {
  return new paper.Path(options)
}
