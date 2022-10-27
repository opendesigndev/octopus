import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo'

import { SourceEffectFillGradientColor } from './source-effect-fill-gradient-color'
import { SourceEffectFillGradientOpacity } from './source-effect-fill-gradient-opacity'
import { SourceEntity } from './source-entity'

import type { RawFillGradient } from '../../typings/raw'

export class SourceEffectFillGradient extends SourceEntity {
  protected _rawValue: RawFillGradient | undefined

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
