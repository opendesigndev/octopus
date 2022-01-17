import type { RawLayerShape, RawShapeFill, RawShapeStrokeStyle } from '../../typings/source'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'

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
      color: {
        blue: fill?.color?.blue ?? 0,
        green: fill?.color?.green ?? 0,
        red: fill?.color?.red ?? 0,
      }, // TODO
    } as RawShapeFill
  }

  get layerEffects() {
    return this._rawValue.layerEffects // TODO
  }

  get mask() {
    return this._rawValue.mask // TODO
  }

  get path() {
    return this._rawValue.path // TODO
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
