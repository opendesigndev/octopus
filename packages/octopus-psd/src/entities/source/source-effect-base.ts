import { SourceEntity } from './source-entity.js'

import type { RawEffectShadow } from '../../typings/raw'

export class SourceEffectBase extends SourceEntity {
  protected _rawValue: RawEffectShadow | undefined

  constructor(rawValue: RawEffectShadow | undefined) {
    super(rawValue)
  }

  get blendMode(): string | undefined {
    return this._rawValue?.Md
  }

  get enabled(): boolean {
    return this._rawValue?.enab ?? true
  }
}
