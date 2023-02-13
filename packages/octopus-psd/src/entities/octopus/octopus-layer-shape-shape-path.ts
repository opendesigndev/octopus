import { getMapped } from '@opendesign/octopus-common/utils/common'

import { logger } from '../../services/instances/logger'
import { createDefaultTranslationMatrix, isRectangle } from '../../utils/path'
import { createPathData } from '../../utils/path-data'

import type { Octopus } from '../../typings/octopus'
import type { SourceCombineOperation } from '../../typings/source'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourcePathComponent } from '../source/source-path-component'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

type OctopusLayerShapeShapePathOptions = {
  parentLayer: OctopusLayerShapeShapeAdapter
}

export class OctopusLayerShapeShapePath {
  private _parentLayer: OctopusLayerShapeShapeAdapter

  static COMPOUND_OPERATION_MAP = {
    add: 'UNION',
    subtract: 'SUBTRACT',
    interfaceIconFrameDimmed: 'INTERSECT',
    xor: 'EXCLUDE',
  } as const

  constructor(options: OctopusLayerShapeShapePathOptions) {
    this._parentLayer = options.parentLayer
  }

  get sourceLayer(): SourceLayerShape {
    return this._parentLayer.sourceLayer
  }

  private isRectangle(): boolean {
    if (this.sourceLayer.type === 'layer') return true
    const sourceLayer = this.sourceLayer as SourceLayerShape

    const component = sourceLayer.firstPathComponent
    const type = component?.origin?.type
    if (type !== 'rect') {
      return false
    }

    const subpathList = component?.subpathListKey ?? []
    const points = subpathList[0]?.points ?? []
    const pointsMapped = points?.map((point) => point.anchor)

    return isRectangle(pointsMapped)
  }

  private _getShapeType(pathComponents: SourcePathComponent[]): Octopus['PathType'] {
    if (pathComponents.length > 1) return 'COMPOUND'
    if (this.isRectangle()) return 'RECTANGLE'
    return 'PATH'
  }

  private _getPathBase(pathComponents: SourcePathComponent[]): Octopus['PathBase'] {
    return {
      type: this._getShapeType(pathComponents),
      transform: createDefaultTranslationMatrix(),
    }
  }

  private _getCompoundOperation(operation: SourceCombineOperation | undefined): Octopus['BooleanOp'] {
    const result = getMapped(operation, OctopusLayerShapeShapePath.COMPOUND_OPERATION_MAP, undefined)
    if (!result) {
      logger.warn('Unknown Compound operation', { operation })
      return 'UNION'
    }
    return result
  }

  private _splitByOperation(pathComponents: SourcePathComponent[]) {
    let index = pathComponents.length - 1
    const operation = this._getCompoundOperation(pathComponents[index]?.shapeOperation)
    const same: SourcePathComponent[] = []
    for (; index >= 0; index--) {
      const last = pathComponents[index]
      const lastOp = this._getCompoundOperation(last?.shapeOperation)
      if (lastOp !== operation) break
      same.push(last)
    }
    const rest = index >= 0 ? pathComponents.slice(0, index + 1) : []
    return [same, rest]
  }

  private _getPathCompound(pathComponents: SourcePathComponent[]): Octopus['CompoundPath'] {
    const [same, rest] = this._splitByOperation(pathComponents)
    const op = this._getCompoundOperation(same[0]?.shapeOperation)
    const sameConverted = same.map((path) => this._convert([path]))
    const paths = rest.length ? [this._convert(rest), ...sameConverted] : sameConverted
    return { ...this._getPathBase(pathComponents), type: 'COMPOUND', op, paths }
  }

  private _getPathRectangle(pathComponents: SourcePathComponent[]): Octopus['PathRectangle'] {
    const rect = pathComponents[0]
    const { bottom, left, right, top } = rect.origin.bounds
    const [layerTx, layerTy] = this._parentLayer.layerTranslation
    const tx = left - layerTx
    const ty = top - layerTy
    const transform = createDefaultTranslationMatrix([tx, ty])
    const rectangle = { x0: 0, y0: 0, x1: right - left, y1: bottom - top }
    const cornerRadius = rect.origin.radii.topLeft
    return { ...this._getPathBase(pathComponents), type: 'RECTANGLE', transform, rectangle, cornerRadius }
  }

  private _getPath(pathComponents: SourcePathComponent[]): Octopus['Path'] {
    const path = pathComponents[0]
    const layerTranslation = this._parentLayer.layerTranslation
    const geometry = createPathData(path, layerTranslation)
    if (geometry === '') logger.warn('PathData generated empty')
    return {
      ...this._getPathBase(pathComponents),
      type: 'PATH',
      geometry,
    }
  }

  private _convert(pathComponents: SourcePathComponent[]): Octopus['PathLike'] {
    switch (this._getShapeType(pathComponents)) {
      case 'COMPOUND': {
        return this._getPathCompound(pathComponents)
      }
      case 'RECTANGLE': {
        return this._getPathRectangle(pathComponents)
      }
    }
    return this._getPath(pathComponents)
  }

  convert(): Octopus['PathLike'] {
    return this._convert(this.sourceLayer.pathComponents)
  }
}
