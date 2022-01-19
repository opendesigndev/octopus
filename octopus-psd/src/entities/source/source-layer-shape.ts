import type { RawLayerShape, RawShapeFill, RawShapePath, RawShapeStrokeStyle } from '../../typings/source'
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
      class: fill?.class,
      color: getColorFor(fill?.color),
      // TODO
    } as RawShapeFill
  }

  get layerEffects() {
    return this._rawValue.layerEffects // TODO
  }

  get mask() {
    return this._rawValue.mask // TODO
  }

  get pathBounds() {
    return getBoundsFor(this._rawValue.path?.bounds)
  }

  private _mapOrigin(origin: RawOrigin | undefined) {
    return {
      Trnf: getMatrixFor(origin?.Trnf),
      bounds: { ...getBoundsFor(origin?.bounds), unitValueQuadVersion: origin?.bounds?.unitValueQuadVersion },
      type: origin?.type ? origin.type.toString() : undefined,
    }
  }

  get firstPathComponent(): RawPathComponent | undefined {
    return this.pathComponents[0]
  }

  get pathComponents() {
    const pathComponents =
      this._rawValue.path?.pathComponents?.map((component) => ({
        origin: this._mapOrigin(component.origin),
        shapeOperation: component.shapeOperation,
        subpathListKey: component.subpathListKey,
      })) ?? []
    return pathComponents as RawPathComponent[]
  }

  get path() {
    const path = this._rawValue.path
    return {
      bounds: this.pathBounds,
      defaultFill: path?.defaultFill,
      pathComponents: this.pathComponents,
    } as RawShapePath
  }

  get strokeStyle() {
    const style = this._rawValue.strokeStyle
    return {
      fillEnabled: style?.fillEnabled,
      strokeEnabled: style?.strokeEnabled,
      strokeStyleBlendMode: style?.strokeStyleBlendMode,
      strokeStyleContent: {
        color: style?.strokeStyleContent?.color,
      },
      strokeStyleLineAlignment: style?.strokeStyleLineAlignment,
      strokeStyleLineCapType: style?.strokeStyleLineCapType,
      strokeStyleLineDashOffset: {
        units: style?.strokeStyleLineDashOffset?.units,
        value: style?.strokeStyleLineDashOffset?.value,
      },
      strokeStyleLineJoinType: style?.strokeStyleLineJoinType,
      strokeStyleLineWidth: style?.strokeStyleLineWidth,
      strokeStyleMiterLimit: style?.strokeStyleMiterLimit,
      strokeStyleOpacity: {
        units: style?.strokeStyleOpacity?.units,
        value: style?.strokeStyleOpacity?.value,
      },
      strokeStyleResolution: style?.strokeStyleResolution,
      strokeStyleScaleLock: style?.strokeStyleScaleLock,
      strokeStyleStrokeAdjust: style?.strokeStyleStrokeAdjust,
      strokeStyleVersion: style?.strokeStyleVersion,
    } as RawShapeStrokeStyle
  }
}
