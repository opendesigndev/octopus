import { asNumber } from '@opendesign/octopus-common/dist/utils/as.js'

import { DEFAULTS } from './defaults.js'

import type { PathData, BezierKnot, PathRecord, PointCoordinate } from '../typings/raw/layer-shape.js'
import type { RawSubpathPoint, VectorOriginationDatakeyDescriptor } from '../typings/raw/path-component.js'
import type { RawBounds } from '../typings/raw/shared.js'
import type { RawSourcePathComponent, RawSourceSubpath, DocumentDimensions } from '../typings/source.js'

type Point = { x?: number; y?: number }

export type Points = (Point | undefined)[]

export function isRectangle(points: Points): boolean {
  if (points.length !== 4) return false
  const [topLeft, topRight, bottomRight, bottomLeft] = points
  const top = topLeft?.y === topRight?.y
  const bottom = bottomLeft?.y === bottomRight?.y
  const left = topLeft?.x === bottomLeft?.x
  const right = topRight?.x === bottomRight?.x
  return top && bottom && left && right
}

/**
 *     tlt -- trt
 *   tll        trr
 *   |            |
 *   |            |
 *   bll        brr
 *     blb -- brb
 */
export function isRoundedRectangle(points: Points): boolean {
  if (points.length !== 8) return false
  const [tlt, trt, trr, brr, brb, blb, bll, tll] = points
  const top = tll?.y === trr?.y && tlt?.y === trt?.y
  const bottom = bll?.y === brr?.y && blb?.y === brb?.y
  const left = tll?.x === bll?.x && tlt?.x === blb?.x
  const right = trt?.x === brb?.x && trr?.x === brr?.x
  return top && bottom && left && right
}

export function createDefaultTranslationMatrix(translate: readonly [number, number] | undefined = [0, 0]): number[] {
  const [xx, xy, yx, yy] = [...DEFAULTS.LAYER_TRANSFORM]
  return [xx, xy, yx, yy, ...translate]
}

export function mergeBounds(boundsArr: RawBounds[]): RawBounds {
  return (
    boundsArr.reduce<RawBounds | null>((mergedBounds, bounds) => {
      if (!mergedBounds) {
        return bounds
      }

      return {
        Top: Math.min(asNumber(mergedBounds.Top, 0), asNumber(bounds.Top, 0)),
        Left: Math.min(asNumber(mergedBounds.Left, 0), asNumber(bounds.Left, 0)),
        Btom: Math.max(asNumber(mergedBounds.Btom, 0), asNumber(bounds.Btom, 0)),
        Rght: Math.max(asNumber(mergedBounds.Rght, 0), asNumber(bounds.Rght, 0)),
      }
    }, null) ?? {}
  )
}

export function parsePointCoordinate({ vert, horiz }: PointCoordinate, { width, height }: DocumentDimensions) {
  return {
    x: (horiz ?? 0) * width,
    y: (vert ?? 0) * height,
  }
}

export function parseBezierKnot(knot: BezierKnot, documentDimensions: DocumentDimensions): RawSubpathPoint {
  return {
    ...(knot.anchor ? { anchor: parsePointCoordinate(knot.anchor, documentDimensions) } : null),
    ...(knot.preceding ? { backward: parsePointCoordinate(knot.preceding, documentDimensions) } : null),
    ...(knot.leaving ? { forward: parsePointCoordinate(knot.leaving, documentDimensions) } : null),
  }
}

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never

function isBezierKnot(path: PathData): path is BezierKnot {
  const { type } = path

  if (!type) {
    return false
  }

  return DEFAULTS.BEZIER_KNOT_TYPE.includes(type as ArrayElement<typeof DEFAULTS.BEZIER_KNOT_TYPE>)
}

function isPathRecord(path: PathData): path is PathRecord {
  const { type } = path

  if (!Number.isInteger(type)) {
    return false
  }

  return DEFAULTS.PATH_RECORD_TYPE.includes(type as ArrayElement<typeof DEFAULTS.PATH_RECORD_TYPE>)
}

function pushToComponentChunk(componentChunk: PathData[] | undefined, pathData: PathData) {
  if (!componentChunk) {
    throw new Error('Invalid pathData type in vmss or vmsk pathRecords')
  }

  componentChunk.push(pathData)
}

function distributePathRecordsToComponentChunks(pathData: PathData[]): PathData[][] {
  return pathData.reduce<PathData[][]>((componentChunks, pointOrRecord) => {
    const lastComponentChunk = componentChunks[componentChunks.length - 1]
    if (isBezierKnot(pointOrRecord)) {
      pushToComponentChunk(lastComponentChunk, pointOrRecord)
    }
    if (isPathRecord(pointOrRecord)) {
      if (pointOrRecord.operation === DEFAULTS.SUBPATH_OPERATION_NONE) {
        pushToComponentChunk(lastComponentChunk, pointOrRecord)
        return componentChunks
      }
      componentChunks.push([pointOrRecord])
      return componentChunks
    }

    return componentChunks
  }, [])
}

function createSubpathListKey(pathData: PathData[], bounds: DocumentDimensions): RawSourceSubpath[] {
  return pathData.reduce<RawSourceSubpath[]>((subpathArr, pathOrRecord) => {
    const lastSubpath = subpathArr[subpathArr.length - 1]

    if (isPathRecord(pathOrRecord)) {
      subpathArr.push({
        points: [],
        closedSubpath: pathOrRecord.type,
      })
      return subpathArr
    }

    if (isBezierKnot(pathOrRecord)) {
      lastSubpath.points.push(parseBezierKnot(pathOrRecord, bounds))
    }

    return subpathArr
  }, [])
}

export function createSourcePathComponents(
  pathData: PathData[],
  originationArray: VectorOriginationDatakeyDescriptor[],
  bounds: DocumentDimensions
): RawSourcePathComponent[] {
  const componentChunks = distributePathRecordsToComponentChunks(pathData)
  return componentChunks.map((componentChunk, idx) => {
    return {
      origin: originationArray[idx],
      shapeOperation: (componentChunk[0] as PathRecord).operation,
      subpathListKey: createSubpathListKey(componentChunk, bounds),
    }
  })
}
