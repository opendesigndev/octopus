import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import PROPS from '../../utils/prop-names.js'
import { SourceEffectFillGradientColor } from './source-effect-fill-gradient-color.js'
import { SourceEffectFillGradientOpacity } from './source-effect-fill-gradient-opacity.js'
import { SourceEntity } from './source-entity.js'

import type { RawFillGradient } from '../../typings/raw/index.js'

export class SourceEffectFillGradient extends SourceEntity {
  declare _rawValue: RawFillGradient | undefined

  constructor(raw: RawFillGradient | undefined) {
    super(raw)
  }

  @firstCallMemo()
  get colors(): SourceEffectFillGradientColor[] | undefined {
    const rawColors = asArray(this._rawValue?.[PROPS.COLORS])
    return rawColors.map((color) => new SourceEffectFillGradientColor(color))
  }

  @firstCallMemo()
  get opacities(): SourceEffectFillGradientOpacity[] | undefined {
    const rawOpacities = asArray(this._rawValue?.[PROPS.TRANSPARENCY])
    return rawOpacities.map((opacity) => new SourceEffectFillGradientOpacity(opacity))
  }
}
