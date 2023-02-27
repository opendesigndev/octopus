import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

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
    return this._rawValue?.colors?.map((color) => new SourceEffectFillGradientColor(color))
  }

  @firstCallMemo()
  get opacities(): SourceEffectFillGradientOpacity[] | undefined {
    return this._rawValue?.transparency?.map((opacity) => new SourceEffectFillGradientOpacity(opacity))
  }
}
