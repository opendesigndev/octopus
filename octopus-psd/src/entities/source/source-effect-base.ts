import type { RawBlendMode, RawEffectShadow } from '../../typings/raw'
import { SourceEntity } from './source-entity'

export class SourceEffectBase extends SourceEntity {
  protected _rawValue: RawEffectShadow | undefined

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
