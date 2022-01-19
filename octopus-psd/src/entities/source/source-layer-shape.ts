import type {
  RawLayerEffect,
  RawLayerShape,
  RawShapeFill,
  RawShapeMask,
  RawShapePath,
  RawShapeStrokeStyle,
} from '../../typings/source'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { getBoundsFor, getColorFor, getMatrixFor } from './utils'
import { RawOrigin, RawPathComponent } from '../../typings/source/path-component'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerShapeOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  get alignEdges() {
    return this._rawValue.alignEdges
  }

  get fill() {
    const fill = this._rawValue.fill
    return {
      ...fill,
      color: getColorFor(fill?.color),
    } as RawShapeFill
  }

  get layerEffects() {
    const layerEffects = this._rawValue.layerEffects
    return {
      ...layerEffects,
    } as RawLayerEffect
  }

  get mask() {
    const mask = this._rawValue.mask
    return {
      ...mask,
    } as RawShapeMask
  }

  get pathBounds() {
    return getBoundsFor(this._rawValue.path?.bounds)
  }

  private _mapOrigin(origin: RawOrigin | undefined) {
    return {
      ...origin,
      Trnf: getMatrixFor(origin?.Trnf),
      bounds: { ...origin?.bounds, ...getBoundsFor(origin?.bounds) },
      type: origin?.type ? origin.type.toString() : undefined,
    }
  }

  get firstPathComponent(): RawPathComponent | undefined {
    return this.pathComponents[0]
  }

  get pathComponents() {
    const pathComponents =
      this._rawValue.path?.pathComponents?.map((component) => ({
        ...component,
        origin: this._mapOrigin(component.origin),
      })) ?? []
    return pathComponents as RawPathComponent[]
  }

  get path() {
    const path = this._rawValue.path
    return {
      ...path,
      bounds: this.pathBounds,
      defaultFill: path?.defaultFill,
      pathComponents: this.pathComponents,
    } as RawShapePath
  }

  get strokeStyle() {
    const strokeStyle = this._rawValue.strokeStyle
    return {
      ...strokeStyle,
    } as RawShapeStrokeStyle
  }
}
