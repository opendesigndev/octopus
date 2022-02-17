import type { RawLayerShape } from '../../typings/raw'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { SourcePath } from './source-path'
import type { SourcePathComponent } from './source-path-component'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEffectStroke } from './source-effect-stroke'
import { SourceShapeMask } from './source-shape-mask'
import { SourceLayerEffect } from './source-effect-layer'
import { SourceBounds } from '../../typings/source'

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
    return new SourcePath(this._rawValue.path)
  }

  get pathComponents(): SourcePathComponent[] {
    return this.path.pathComponents
  }

  get firstPathComponent(): SourcePathComponent | undefined {
    return this.pathComponents[0]
  }

  get pathBounds(): SourceBounds {
    return this.path.bounds
  }

  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue.fill)
  }

  get stroke(): SourceEffectStroke {
    return new SourceEffectStroke(this._rawValue.strokeStyle)
  }

  get mask(): SourceShapeMask {
    return new SourceShapeMask(this._rawValue.mask)
  }

  get layerEffects(): SourceLayerEffect {
    return new SourceLayerEffect(this._rawValue.layerEffects)
  }
}
