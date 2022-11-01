import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceEffectFill } from './source-effect-fill.js'
import { SourceLayerCommon } from './source-layer-common.js'

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
