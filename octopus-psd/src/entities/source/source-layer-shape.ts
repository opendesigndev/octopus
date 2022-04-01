import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawLayerShape } from '../../typings/raw'
import { SourceBounds } from '../../typings/source'
import { SourceEffectFill } from './source-effect-fill'
import type { SourceLayerParent } from './source-layer-common'
import { SourceLayerCommon } from './source-layer-common'
import { SourcePath } from './source-path'
import type { SourcePathComponent } from './source-path-component'
import { SourceStroke } from './source-stroke'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

export class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawLayerShape
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._parent = options.parent
    this._rawValue = options.rawValue
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
    return new SourceEffectFill(this._rawValue.fill)
  }

  @firstCallMemo()
  get stroke(): SourceStroke {
    return new SourceStroke(this._rawValue.strokeStyle)
  }
}
