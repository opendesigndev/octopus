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
import { getMapped } from './common'

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
  if (point.forward || point.backward) return createBezierSegment(point)
  return createPointSegment(point.anchor)
}

const createSubpath = (subpath: RawSubpath): paper.PathItem => {
  const points = subpath.points ?? []
  const segments = points.map(pointToSegment)
  const shape = createPath(segments)
  shape.closed = subpath.closedSubpath ?? false
  return shape
}

const processSubpaths = (subpaths: RawSubpath[]): paper.PathItem | null => {
  const subpathEntities = subpaths
    .filter((subpath) => (subpath.points?.length ?? 0) > 1)
    .map((subpath: RawSubpath) => createSubpath(subpath))

  if (!subpathEntities.length) return null // TODO LOG ERROR
  return subpathEntities.reduce((prev: paper.PathItem, current: paper.PathItem): paper.PathItem => {
    prev.closePath()
    current.closePath()
    return prev.exclude(current)
  })
}

const processPath = (pathComponent: RawPathComponent): paper.PathItem | null => {
  return processSubpaths(pathComponent?.subpathListKey ?? [])
}

type PathOperation = 'unite' | 'subtract' | 'intersect' | 'exclude'

const booleanOperation = (prev: paper.PathItem, current: paper.PathItem, operation: PathOperation): paper.PathItem => {
  return prev[operation](current)
}

const CONVERT_OPERATION_MAP: { [key: string]: PathOperation } = {
  add: 'unite',
  subtract: 'subtract',
  interfaceIconFrameDimmed: 'intersect',
  xor: 'exclude',
}

const convertOperation = (operation: RawCombineOperation | undefined): PathOperation => {
  const result = getMapped(operation, CONVERT_OPERATION_MAP, undefined)
  if (!result) {
    // this._parent.converter?.logWarn('Unknown Compound operation', { operation }) // TODO
    return 'unite'
  }
  return result
}

type ShapeWithOperation = { shape: paper.PathItem; operation: PathOperation }

const serveShapesFromPath = (pathComponent: RawPathComponent): ShapeWithOperation | null => {
  const shape = processPath(pathComponent)
  if (shape === null) return null // TODO LOG ERROR
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
  const shapePaths = pathComponents
    // .filter(isValidPath)
    .map(serveShapesFromPath)
    .filter((shape) => shape) as ShapeWithOperation[]

  console.info('X shapePaths', shapePaths) // TODO HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE

  if (!shapePaths.length) return '' // TODO LOG ERROR

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
