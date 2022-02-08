import type { Octopus } from '../../typings/octopus'
import { asNumber } from '@avocode/octopus-common/dist/utils/as'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import { createPathData } from '../../utils/path-data'
import { createDefaultTranslationMatrix, isRectangle, isRoundedRectangle } from '../../utils/path'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import type { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'
import type { SourcePathComponent } from '../source/shape-path'
import type { SourceCombineOperation } from '../source/types'

type OctopusPathLikeOptions = {
  parent: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter
}

export class OctopusPathLike {
  protected _parent: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter

  static COMPOUND_OPERATION_MAP = {
    add: 'UNION',
    subtract: 'SUBTRACT',
    interfaceIconFrameDimmed: 'INTERSECT',
    xor: 'EXCLUDE',
  } as const

  constructor(options: OctopusPathLikeOptions) {
    this._parent = options.parent
  }

  get sourceLayer(): SourceLayerShape | SourceLayerLayer {
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
    const result = getMapped(operation, OctopusPathLike.COMPOUND_OPERATION_MAP, undefined)
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
      op: this._getCompoundOperation(last?.shapeOperation),
      paths: [this._convert(rest), this._convert([last])],
    }
  }

  private _getPathRectangle(pathComponents: SourcePathComponent[]): Octopus['PathRectangle'] {
    const rect = pathComponents[0]
    const { bottom, left, right, top } = rect?.origin?.bounds ?? {}
    const [layerTx, layerTy] = this._parent.layerTranslation
    const tx = asNumber(left) - asNumber(layerTx)
    const ty = asNumber(top) - asNumber(layerTy)
    const transform = createDefaultTranslationMatrix([tx, ty])
    const rectangle = {
      x0: 0,
      y0: 0,
      x1: asNumber(right) - asNumber(layerTx) - asNumber(tx),
      y1: asNumber(bottom) - asNumber(layerTy) - asNumber(ty),
    }
    const { bottomLeft, bottomRight, topLeft, topRight } = rect?.origin?.radii ?? {}
    const cornerRadii = [asNumber(topLeft, 0), asNumber(topRight, 0), asNumber(bottomRight, 0), asNumber(bottomLeft, 0)]
    return { ...this._getPathBase(pathComponents), transform, rectangle, cornerRadii }
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
    if (this.sourceLayer.type === 'shapeLayer') {
      const sourceLayer = this.sourceLayer as SourceLayerShape
      return this._convert(sourceLayer.pathComponents)
    } else {
      const sourceLayer = this.sourceLayer as SourceLayerLayer
      const { width, height } = sourceLayer.dimensions
      const rectangle = { x0: 0, y0: 0, x1: width, y1: height }
      const transform = createDefaultTranslationMatrix()
      return { type: 'RECTANGLE', rectangle, transform }
    }
  }
}
