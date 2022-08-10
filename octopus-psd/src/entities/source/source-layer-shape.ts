import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { SourceEffectFill } from './source-effect-fill.js'
import { SourceLayerCommon } from './source-layer-common.js'
import { SourcePath } from './source-path.js'
import { SourceStroke } from './source-stroke.js'

import type { RawLayerShape } from '../../typings/raw/index.js'
import type { SourceBounds } from '../../typings/source.js'
import type { SourceLayerParent } from './source-layer-common.js'
import type { SourcePathComponent } from './source-path-component.js'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape

  constructor(options: SourceLayerShapeOptions) {
    super(options)
  }

  @firstCallMemo()
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

  @firstCallMemo()
  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue.fill, this._rawValue.strokeStyle?.fillEnabled)
  }

  @firstCallMemo()
  get stroke(): SourceStroke {
    return new SourceStroke(this._rawValue.strokeStyle)
  }
}
