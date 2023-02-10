import { firstCallMemo } from '@opendesign/octopus-common/decorators/first-call-memo'

import { SourceEffectFill } from './source-effect-fill'
import { SourceLayerCommon } from './source-layer-common'
import { SourcePath } from './source-path'
import { SourceStroke } from './source-stroke'

import type { RawLayerShape } from '../../typings/raw/index'
import type { SourceBounds } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'
import type { SourcePathComponent } from './source-path-component'

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
