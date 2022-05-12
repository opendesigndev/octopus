import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { SourceEffectFill } from './source-effect-fill'
import { SourceLayerCommon } from './source-layer-common'

import type { RawLayerAdjustment } from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerLayerOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerAdjustment
}

export class SourceLayerAdjustment extends SourceLayerCommon {
  protected _rawValue: RawLayerAdjustment

  constructor(options: SourceLayerLayerOptions) {
    super(options)
  }

  @firstCallMemo()
  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue.fill)
  }
}
