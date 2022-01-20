import { LayerSpecifics, OctopusLayerCommon, OctopusLayerParent } from './octopus-layer-common'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { Octopus } from '../../typings/octopus'
import { asNumber } from '../../utils/as'
import { RawPathComponent } from '../../typings/source/path-component'
import { RawCombineOperation } from '../../typings/source/shared'
import { isRectangle } from '../../utils/shape'

type OctopusLayerShapeShapeAdapterOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export class OctopusLayerShapeShapeAdapter extends OctopusLayerCommon {
  protected _parent: OctopusLayerParent
  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusLayerShapeShapeAdapterOptions) {
    super(options)
  }

  private get isRectangle(): boolean {
    const component = this._sourceLayer.firstPathComponent
    const type = component?.origin?.type
    if (type !== 'rect' && type !== 'roundedRect') {
      return false
    }

    const subpathList = component?.subpathListKey ?? []
    const points = subpathList[0]?.points ?? []
    return isRectangle(points?.map((point) => point.anchor))
  }

  private _getShapeType(pathComponents: RawPathComponent[]): Octopus['PathType'] {
    if (pathComponents.length > 1) {
      return 'COMPOUND'
    } else if (this.isRectangle) {
      return 'RECTANGLE'
    }
    return 'PATH'
  }

  protected get layerTranslate() {
    const pathBounds = this._sourceLayer.pathBounds
    return [pathBounds.left, pathBounds.top]
  }

  private _getPathBase(pathComponents: RawPathComponent[]): Octopus['PathBase'] {
    return {
      type: this._getShapeType(pathComponents),
      // transform: [...DEFAULTS.LAYER_TRANSFORM],
    }
  }

  private _getCompoundOperation(operation: RawCombineOperation | undefined): Octopus['BooleanOp'] {
    const map: { [key: string]: Octopus['BooleanOp'] } = {
      add: 'UNION',
      subtract: 'SUBTRACT',
      interfaceIconFrameDimmed: 'INTERSECT',
      xor: 'EXCLUDE',
    }
    const result = map[operation as string]
    if (!result) {
      this.converter?.logger?.warn('Unknown Compound operation', { extra: { operation } })
      this.converter?.sentry?.captureMessage('Unknown Compound operation', { extra: { operation } })
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
      paths: [this._getPathLike(rest), this._getPathLike([last])],
    }
  }

  private _getPathRectangle(pathComponents: RawPathComponent[]): Octopus['PathRectangle'] {
    const rect = pathComponents[0]
    const { bottom, left, right, top } = rect?.origin?.bounds ?? {}
    const rectangle = {
      x0: asNumber(left),
      y0: asNumber(top),
      x1: asNumber(right),
      y1: asNumber(bottom),
    }
    const { bottomLeft, bottomRight, topLeft, topRight } = rect?.origin?.radii ?? {}
    const cornerRadii = [asNumber(topLeft, 0), asNumber(topRight, 0), asNumber(bottomRight, 0), asNumber(bottomLeft, 0)]
    return { ...this._getPathBase(pathComponents), rectangle, cornerRadii }
  }

  private _getPath(pathComponents: RawPathComponent[]): Octopus['Path'] {
    return {
      ...this._getPathBase(pathComponents),
      geometry: 'TODO', // this._shapeData, // TODO
    }
  }

  private _getPathLike(pathComponents: RawPathComponent[]): Octopus['PathLike'] {
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

  private get _shapes(): Octopus['Shape'][] {
    const fillShape: Octopus['Shape'] = {
      purpose: 'BODY',
      fillRule: 'EVEN_ODD',
      path: this._getPathLike(this._sourceLayer.pathComponents),
      // ...this.shapeEffects.convert() // TODO
    }
    return [fillShape]
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    return {
      type: 'SHAPE',
      shapes: this._shapes,
    } as const
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
