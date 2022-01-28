import type { RawLayerShape } from '../../typings/source'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { mapPath } from './shape-path'
import type { SourcePathComponent, SourcePath } from './shape-path'
import { mapShapeFill, SourceShapeFill } from './shape-fill'
import { mapShapeStroke, SourceShapeStrokeStyle } from './shape-stroke'
import { mapShapeMask, SourceShapeMask } from './shape-mask'
import { mapLayerEffect, SourceLayerEffect } from './effect'

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
    return mapPath(this._rawValue.path)
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
    return mapShapeFill(this._rawValue.fill)
  }

  get strokeStyle(): SourceShapeStrokeStyle {
    return mapShapeStroke(this._rawValue.strokeStyle)
  }

  get mask(): SourceShapeMask {
    return mapShapeMask(this._rawValue.mask)
  }
  get layerEffects(): SourceLayerEffect {
    return mapLayerEffect(this._rawValue.layerEffects)
  }
}
