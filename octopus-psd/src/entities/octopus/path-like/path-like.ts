import type { Octopus } from '../../../typings/octopus'
import type { RawCombineOperation, RawPathComponent } from '../../../typings/source'
import { asNumber } from '../../../utils/as'
import { getMapped } from '../../../utils/common'
import { createShape } from '../../../utils/create-shape'
import { createDefaultTranslationMatrix, isRectangle, isRoundedRectangle } from '../../../utils/path'
import type { SourceLayerShape } from '../../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from '../octopus-layer-shape-shape-adapter'

type OctopusPathLikeOptions = {
  parent: OctopusLayerShapeShapeAdapter
  sourceLayer: SourceLayerShape
}

export default class OctopusPathLike {
  protected _parent: OctopusLayerShapeShapeAdapter
  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusPathLikeOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer
  }

  static COMPOUND_OPERATION_MAP = {
    add: 'UNION',
    subtract: 'SUBTRACT',
    interfaceIconFrameDimmed: 'INTERSECT',
    xor: 'EXCLUDE',
  } as const

  private get isRectangle(): boolean {
    const component = this._sourceLayer.firstPathComponent
    const type = component?.origin?.type
    if (type !== 'rect' && type !== 'roundedRect') {
      return false
    }

    const subpathList = component?.subpathListKey ?? []
    const points = subpathList[0]?.points ?? []
    const pointsMapped = points?.map((point) => point.anchor)
    return type === 'roundedRect' ? isRoundedRectangle(pointsMapped) : isRectangle(pointsMapped)
  }

  private _getShapeType(pathComponents: RawPathComponent[]): Octopus['PathType'] {
    if (pathComponents.length > 1) {
      return 'COMPOUND'
    } else if (this.isRectangle) {
      return 'RECTANGLE'
    }
    return 'PATH'
  }

  private _getPathBase(pathComponents: RawPathComponent[]): Octopus['PathBase'] {
    return {
      type: this._getShapeType(pathComponents),
      transform: createDefaultTranslationMatrix(),
    }
  }

  private _getCompoundOperation(operation: RawCombineOperation | undefined): Octopus['BooleanOp'] {
    const result = getMapped(operation, OctopusPathLike.COMPOUND_OPERATION_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Compound operation', { operation })
      return 'UNION'
    }
    return result
  }

  private _getPathCompound(pathComponents: RawPathComponent[]): Octopus['CompoundPath'] {
    const rest = [...pathComponents]
    const last = rest.pop() as RawPathComponent
    return {
      ...this._getPathBase(pathComponents),
      op: this._getCompoundOperation(last?.shapeOperation),
      paths: [this._convert(rest), this._convert([last])],
    }
  }

  private _getPathRectangle(pathComponents: RawPathComponent[]): Octopus['PathRectangle'] {
    const rect = pathComponents[0]
    const { bottom, left, right, top } = rect?.origin?.bounds ?? {}
    const [layerTx, layerTy] = this._parent.layerTranslate
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

  private _getPath(pathComponents: RawPathComponent[]): Octopus['Path'] {
    return {
      ...this._getPathBase(pathComponents),
      geometry: createShape(pathComponents),
    }
  }

  private _convert(pathComponents: RawPathComponent[]): Octopus['PathLike'] {
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

  convert() {
    return this._convert(this._sourceLayer.pathComponents)
  }
}
