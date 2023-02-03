import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import PROPS from '../../utils/prop-names.js'
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
    const fill =
      this._rawValue.layerProperties?.[PROPS.SOLID_COLOR_SHEET_SETTING] ??
      this._rawValue.layerProperties?.[PROPS.GRADIENT_FILL_SETTING]
    return new SourceEffectFill(fill)
  }
}
