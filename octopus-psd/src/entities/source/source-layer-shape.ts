import type { RawLayerShape } from '../../typings/source'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { convertRawPath } from './source-path'
import type { SourcePathComponent, SourcePath } from './source-path'
import { convertRawShapeFill, SourceEffectFill, SourceShapeFill } from './source-effect-fill'
import { convertRawShapeStroke, SourceShapeStrokeStyle } from './source-shape-stroke'
import { convertRawShapeMask, SourceShapeMask } from './source-shape-mask'
import { convertRawLayerEffect, SourceLayerEffect } from './source-effect-layer'

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

  get path(): SourcePath {
    return convertRawPath(this._rawValue.path)
  }

  get pathComponents(): SourcePathComponent[] {
    return this.path.pathComponents
  }

  get firstPathComponent(): SourcePathComponent | undefined {
    return this.pathComponents[0]
  }

  get pathBounds() {
    return this.path.bounds
  }

  get fill(): SourceShapeFill {
    return convertRawShapeFill(this._rawValue.fill)
  }

  get strokeStyle(): SourceShapeStrokeStyle {
    return convertRawShapeStroke(this._rawValue.strokeStyle)
  }

  get mask(): SourceShapeMask {
    return convertRawShapeMask(this._rawValue.mask)
  }
  get layerEffects(): SourceLayerEffect {
    return convertRawLayerEffect(this._rawValue.layerEffects)
  }
}
