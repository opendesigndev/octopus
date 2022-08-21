import { SourceLayerXObjectForm } from '../entities/source/source-layer-x-object-form'

import type { SourceLayerParent } from '../entities/source/source-layer-common'
import type { SourceLayerShape } from '../entities/source/source-layer-shape'
import type { ClippedSourceLayer } from '../factories/create-source-layer'
import type {
  RawResourcesExtGStateSmask,
  RawResourcesXObject,
  RawShapeLayerSubPath,
  RawShapeLayerSubPathPoint,
} from '../typings/raw'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

type PointTypeSumPair = { sum: number; type: string }
type SubpathSumPair = PointTypeSumPair & { points: PointTypeSumPair[] }

function getPointSum(point: RawShapeLayerSubPathPoint): number {
  return (
    point.Coords?.reduce<number>((sum, coord) => {
      return sum + coord
    }, 0) ?? 0
  )
}

function getPointTypeSumValues(subpath: RawShapeLayerSubPath): PointTypeSumPair[] {
  return (
    subpath.Points?.reduce<PointTypeSumPair[]>((pointSums, point) => {
      const { Type } = point
      if (!Type) {
        return pointSums
      }
      const pointSum = { sum: getPointSum(point), type: Type }
      pointSums.push(pointSum)
      return pointSums
    }, []) ?? []
  )
}

function getSubpathTypeSumValues(subpaths: RawShapeLayerSubPath[]): SubpathSumPair[] {
  return subpaths.reduce<SubpathSumPair[]>((subpathSums, subpath) => {
    const { Type } = subpath
    if (!Type) {
      return subpathSums
    }
    const points = getPointTypeSumValues(subpath)

    const sum = points.reduce<number>((sum, point) => {
      return sum + point.sum
    }, 0)

    const subpathSum = {
      sum,
      points,
      type: Type,
    }

    subpathSums.push(subpathSum)
    return subpathSums
  }, [])
}

export function getMaskGroupHashKey(mask: SourceLayerShape): string | null {
  const { subpaths } = mask

  if (!subpaths) {
    return null
  }

  const reducedSubpaths = getSubpathTypeSumValues(subpaths.map((subpath) => subpath.rawValue))
  let key = ''
  const matrix = mask.transformMatrix

  if (matrix) {
    key = matrix.reduce<string>((key, digit) => {
      key = `${key}-${digit}`
      return key
    }, 'matrix')
  }

  key = reducedSubpaths.reduce<string>((key, subpath) => {
    const subKey = subpath.points.reduce<string>((subKey, point) => {
      subKey = `${subKey}-${point.type}-${point.sum}`
      return subKey
    }, '')

    key = `${key}-${subpath.type}-${subKey}`
    return key
  }, key)

  return key
}

export function initClippingMask(layer: ClippedSourceLayer): Nullable<SourceLayerShape> {
  if (layer.type === 'Shading' || !layer.clippingPaths || !layer.clippingPaths.length) {
    return
  }

  const mask = layer.clippingPaths.reduce((mask, clippingPath, index) => {
    if (index === 0) {
      return mask
    }

    mask.setSubpaths([...mask.subpaths, ...clippingPath.subpaths])

    return mask
  }, layer.clippingPaths[0])

  return mask
}

type CreateSoftMaskOptions = {
  sMask: Nullable<RawResourcesExtGStateSmask>
  parent: SourceLayerParent
}

export function createSoftMask({ sMask, parent }: CreateSoftMaskOptions): Nullable<SourceLayerXObjectForm> {
  const g = sMask?.G

  if (!g) {
    return null
  }

  const subType = 'Subtype' in g ? g.Subtype : ''

  if (subType !== 'Form') {
    return null
  }

  const rawSourceXObject = g as RawResourcesXObject

  if (!rawSourceXObject) {
    return null
  }

  return new SourceLayerXObjectForm({ parent, rawValue: rawSourceXObject })
}
