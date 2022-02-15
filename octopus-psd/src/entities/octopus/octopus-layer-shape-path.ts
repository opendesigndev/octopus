import type { Octopus } from '../../typings/octopus'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import { createPathData } from '../../utils/path-data'
import { createDefaultTranslationMatrix, isRectangle, isRoundedRectangle } from '../../utils/path'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import type { SourcePathComponent } from '../source/source-path-component'
import type { SourceCombineOperation } from '../../typings/source'

type OctopusLayerShapePathOptions = {
  parent: OctopusLayerShapeShapeAdapter
}

export class OctopusLayerShapePath {
  protected _parent: OctopusLayerShapeShapeAdapter

  static COMPOUND_OPERATION_MAP = {
    add: 'UNION',
    subtract: 'SUBTRACT',
    interfaceIconFrameDimmed: 'INTERSECT',
    xor: 'EXCLUDE',
  } as const

  constructor(options: OctopusLayerShapePathOptions) {
    this._parent = options.parent
  }

  get sourceLayer(): SourceLayerShape {
    return this._parent.sourceLayer
  }

  private get isRectangle(): boolean {
    if (this.sourceLayer.type === 'layer') return true
    const sourceLayer = this.sourceLayer as SourceLayerShape

    const component = sourceLayer.firstPathComponent
    const type = component?.origin?.type
    if (type !== 'rect' && type !== 'roundedRect') {
      return false
    }

    const subpathList = component?.subpathListKey ?? []
    const points = subpathList[0]?.points ?? []
    const pointsMapped = points?.map((point) => point.anchor)
    return type === 'roundedRect' ? isRoundedRectangle(pointsMapped) : isRectangle(pointsMapped)
  }

  private _getShapeType(pathComponents: SourcePathComponent[]): Octopus['PathType'] {
    if (pathComponents.length > 1) return 'COMPOUND'
    if (this.isRectangle) return 'RECTANGLE'
    return 'PATH'
  }

  private _getPathBase(pathComponents: SourcePathComponent[]): Octopus['PathBase'] {
    return {
      type: this._getShapeType(pathComponents),
      transform: createDefaultTranslationMatrix(),
    }
  }

  private _getCompoundOperation(operation: SourceCombineOperation | undefined): Octopus['BooleanOp'] {
    const result = getMapped(operation, OctopusLayerShapePath.COMPOUND_OPERATION_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Compound operation', { operation })
      return 'UNION'
    }
    return result
  }

  private _getPathCompound(pathComponents: SourcePathComponent[]): Octopus['CompoundPath'] {
    const rest = [...pathComponents]
    const last = rest.pop() as SourcePathComponent
    return {
      ...this._getPathBase(pathComponents),
      type: 'COMPOUND',
      op: this._getCompoundOperation(last?.shapeOperation),
      paths: [this._convert(rest), this._convert([last])], // TODO: Add optimization to make the compound tree more flat
    }
  }

  private _getPathRectangle(pathComponents: SourcePathComponent[]): Octopus['PathRectangle'] {
    const rect = pathComponents[0]
    const { bottom, left, right, top } = rect.origin.bounds
    const [layerTx, layerTy] = this._parent.layerTranslation
    const tx = left - layerTx
    const ty = top - layerTy
    const transform = createDefaultTranslationMatrix([tx, ty])
    const rectangle = { x0: 0, y0: 0, x1: right - left, y1: bottom - top }
    const { bottomLeft, bottomRight, topLeft, topRight } = rect.origin.radii
    const cornerRadii = [topLeft, topRight, bottomRight, bottomLeft]
    const cornerRadius = cornerRadii[0] // TODO
    return { ...this._getPathBase(pathComponents), type: 'RECTANGLE', transform, rectangle, cornerRadius }
  }

  private _getPath(pathComponents: SourcePathComponent[]): Octopus['Path'] {
    const path = pathComponents[0]
    const layerTranslation = this._parent.layerTranslation
    const geometry = createPathData(path, layerTranslation)
    if (geometry === '') {
      this._parent.converter?.logWarn('PathData generated empty', { path })
    }
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
