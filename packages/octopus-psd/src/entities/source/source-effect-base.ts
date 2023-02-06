import { SourceEntity } from './source-entity.js'

import type { RawEffectShadow } from '../../typings/raw'
import type BLEND_MODES from '../../utils/blend-modes.js'

export class SourceEffectBase extends SourceEntity {
  protected _rawValue: RawEffectShadow | undefined

  constructor(rawValue: RawEffectShadow | undefined) {
    super(rawValue)
  }

  get blendMode(): keyof typeof BLEND_MODES | undefined {
    return this._rawValue?.Md as keyof typeof BLEND_MODES | undefined
  }

  get enabled(): boolean {
    return this._rawValue?.enab ?? true
  }
}
