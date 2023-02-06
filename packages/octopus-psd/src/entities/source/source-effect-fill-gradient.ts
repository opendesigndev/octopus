import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { SourceEffectFillGradientColor } from './source-effect-fill-gradient-color.js'
import { SourceEffectFillGradientOpacity } from './source-effect-fill-gradient-opacity.js'
import { SourceEntity } from './source-entity.js'

import type { RawFillGradient } from '../../typings/raw'
import PROP_NAMES from '../../utils/prop-names.js'

export class SourceEffectFillGradient extends SourceEntity {
  protected _rawValue: RawFillGradient | undefined

  constructor(raw: RawFillGradient | undefined) {
    super(raw)
  }

  @firstCallMemo()
  get colors(): SourceEffectFillGradientColor[] | undefined {
    const rawColors = asArray(this._rawValue?.Clrs)
    return rawColors.map((color) => new SourceEffectFillGradientColor(color))
  }

  @firstCallMemo()
  get opacities(): SourceEffectFillGradientOpacity[] | undefined {
    const rawOpacities = asArray(this._rawValue?.[PROP_NAMES.TRANSPARENCY])
    return rawOpacities.map((opacity) => new SourceEffectFillGradientOpacity(opacity))
  }
}
