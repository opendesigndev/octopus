/**
 * This file is taken from svg-exporter and slightly modified, the purpose of createShape() is
 * to generate paper.CompoundPath | paper.Path based on Raw Source shape.
 */
import { get, isArray } from 'lodash'

import {
  createPath,
  createPathRectangle,
  createPoint,
  createSegment,
  paperBounds,
  createGroup,
} from './paper-factories'

import type { RawSubpath, RawCombineOperation, RawPathComponent, RawSubpathPoint, RawPointXY } from '../typings/source'

function segInOrPoint(seg: paper.Segment) {
  return seg.handleIn.x || seg.handleIn.y ? seg.point.add(seg.handleIn) : seg.point
}

function segOutOrPoint(seg: paper.Segment) {
  return seg.handleOut.x || seg.handleOut.y ? seg.point.add(seg.handleOut) : seg.point
}

const hasHandles = (seg: paper.Segment): boolean => {
  return Boolean(seg.handleIn.x || seg.handleIn.y || seg.handleOut.x || seg.handleOut.y)
}

const applyRadiuses = (path: paper.Path, radiuses: number[]) => {
  const segments = path.segments.slice(0)
  path.segments = []
  const len = segments.length
  return segments.reduce((path, segment, i) => {
    if (hasHandles(segment)) {
      path.add(segment)
      return path
    }
    const curPoint = segment.point
    const next = segments[i + 1 === len ? 0 : i + 1]
    const prev = segments[i - 1 < 0 ? len - 1 : i - 1]
    const nextPoint = segInOrPoint(next)
    const prevPoint = segOutOrPoint(prev)
    const radius = Math.min(
      radiuses[i],
      Math.floor(Math.min(nextPoint.getDistance(curPoint), prevPoint.getDistance(curPoint)) / 2)
    )
    const nextNorm = curPoint.subtract(nextPoint).normalize()
    const prevNorm = curPoint.subtract(prevPoint).normalize()
    const angle = Math.acos(nextNorm.dot(prevNorm))
    const delta = Math.tan(angle / 2) ? radius / Math.tan(angle / 2) : 0
    const prevDelta = prevNorm.normalize(delta)
    const nextDelta = nextNorm.normalize(delta)
    const through = curPoint.subtract(
      prevNorm.add(nextNorm).normalize(Math.sqrt(delta * delta + radius * radius) - radius)
    )
    path.add(curPoint.subtract(prevDelta))
    path.arcTo(through, curPoint.subtract(nextDelta))
    return path
  }, path)
}

// function shapeTransform(
//   shape: paper.CompoundPath,
//   rotation: number,
//   flipH: boolean,
//   flipV: boolean,
//   applyRotations: boolean = false
// ): paper.Path | paper.CompoundPath | paper.Group {
//   let isRotated = false
//   if (applyRotations && typeof rotation === 'number' && rotation !== 0) {
//     isRotated = true
//     shape = createGroup(
//       createPathRectangle(paperBounds(shape as paper.Path)),
//       shape as paper.Path
//     ) as unknown as paper.CompoundPath
//     shape.rotate(-rotation)
//   }
//   shape.scale(flipH ? -1 : 1, flipV ? -1 : 1)
//   return isRotated ? (shape.children[1] as paper.Path) : (shape as paper.Path)
// }

// const isValidPath = (path:  ): boolean => {
//   const subpaths = get(path, 'subpaths')
//   const points = get(path, 'subpaths.0.points')
//   return !((isArray(subpaths) ? [] : subpaths).length === 1 && (isArray(points) ? [] : points).length <= 1)
// }

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

const pointToSegment = (point: RawSubpathPoint): paper.Segment | paper.Point => {
  if (point.forward || point.backward) {
    return createBezierSegment(point)
  } else {
    return createPointSegment(point.anchor)
  }
}

// const extractRadiuses = (points) => {
//   return points.map((point) => get(point, 'radius'))
// }

const createSubpath = (subpath: RawSubpath): paper.PathItem => {
  const points = subpath.points ?? []
  const segments = points.map(pointToSegment)
  const shape = createPath(segments)

  console.info('X')
  console.info('X segments', segments.length)
  console.info('X shape', shape.pathData)
  console.info('X')

  return shape // TODO

  // if (shape.segments.length <= 2) return shape
  // const radiuses = extractRadiuses(subpath.points).map((radius) => {
  //   return typeof radius !== 'number' ? 0 : radius
  // })
  // const roundedShape = applyRadiuses(shape, radiuses)
  // roundedShape.closed = subpath.closed
  // return roundedShape
}

const processSubpaths = (subpaths: RawSubpath[]): paper.PathItem | null => {
  const subpathEntities = subpaths
    .filter((subpath) => (subpath.points?.length ?? 0) > 1)
    .map((subpath: RawSubpath) => createSubpath(subpath))

  console.info('X')
  console.info('X')
  console.info('X')
  console.info('X')
  console.info('X processSubpaths')
  console.info('X subpathEntities', subpathEntities.length)
  console.info('X')
  console.info('X')

  if (!subpathEntities.length) {
    return null
  }

  return null // TODO

  // return subpathEntities.reduce((prev: paper.Path, current: paper.Path): paper.Path => {
  //   ;[prev, current].forEach((shape) => (shape.closed = true))
  //   return prev.exclude(current) as paper.Path
  // })
}

const processPath = (pathComponent: RawPathComponent): paper.PathItem | null => {
  return processSubpaths(pathComponent?.subpathListKey ?? [])
}

type PathOperation = 'unite' | 'subtract' | 'intersect' | 'exclude'

const booleanOperation = (prev: paper.PathItem, current: paper.PathItem, operation: PathOperation): paper.PathItem => {
  return prev[operation](current)
}

const convertOperation = (operation: RawCombineOperation | undefined): PathOperation => {
  if (operation === undefined) {
    return 'unite'
  }
  const map: { [key: string]: PathOperation } = {
    add: 'unite',
    subtract: 'subtract',
    interfaceIconFrameDimmed: 'intersect',
    xor: 'exclude',
  }
  return map[operation]
}

const serveShapesFromPath = (
  pathComponent: RawPathComponent
): { shape: paper.PathItem; operation: PathOperation } | null => {
  const shape = processPath(pathComponent)
  if (shape === null) {
    return null
  }
  const operation = convertOperation(pathComponent?.shapeOperation)
  return { shape, operation }
}

// const pathRanges = (shapePaths) => {
//   const pos = shapePaths.indexOf(shapePaths.find((current) => current.operation === undefined))
//   if (pos !== -1) {
//     const inclusive = pos + 1
//     const rest = shapePaths.slice(inclusive)
//     return rest.length ? [shapePaths.slice(0, inclusive), ...pathRanges(rest)] : [shapePaths.slice(0, inclusive)]
//   }
//   return [shapePaths.slice()]
// }

export function createShape(pathComponents: RawPathComponent[]): string {
  const shapePaths: Array<any> = pathComponents
    // .filter(isValidPath)
    .map(serveShapesFromPath)
    .filter((shape) => shape)

  console.info('X shapePaths', shapePaths)

  if (!shapePaths.length) {
    return ''
  }

  return 'TODO'

  // const ranges = pathRanges(shapePaths.slice().reverse())
  // console.info('X ranges', ranges)

  // const mapped = ranges.map((subset) => {
  //   const subsetPaths = subset.slice().reverse()
  //   return subsetPaths.length === 1
  //     ? {
  //         shape: subsetPaths[0].shape,
  //         ops: [subsetPaths[0].operation],
  //       }
  //     : subsetPaths.reduce((shape, next) => {
  //         return {
  //           shape: booleanOperation(shape.shape, next.shape, next.operation),
  //           ops: [...(isArray(shape.ops) ? shape.ops : []), next.operation],
  //         }
  //       })
  // })

  // console.info('X mapped', mapped)

  // const booleanResult = mapped.reduce((prev, next) => {
  //   return { shape: booleanOperation(prev.shape, next.shape) }
  // })

  // console.info('X booleanResult', JSON.stringify(booleanResult.shape))

  // return booleanResult.shape?.pathData
}
