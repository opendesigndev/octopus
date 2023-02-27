import { SourceEntity } from './source-entity.js'

import type { RawBlendMode, RawEffectShadow } from '../../typings/raw/index.js'

export class SourceEffectBase extends SourceEntity {
  declare _rawValue: RawEffectShadow | undefined

  constructor(raw: RawEffectShadow | undefined) {
    super(raw)
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue?.mode
  }

  get enabled(): boolean {
    return this._rawValue?.enabled ?? true
  }
}
