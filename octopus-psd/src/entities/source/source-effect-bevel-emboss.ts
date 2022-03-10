import type { RawBlendMode, RawEffectBevelEmboss } from '../../typings/raw'
import { SourceEntity } from './source-entity'

export class SourceEffectBevelEmboss extends SourceEntity {
  protected _rawValue: RawEffectBevelEmboss | undefined

  constructor(raw: RawEffectBevelEmboss | undefined) {
    super(raw)
    this._rawValue = raw
  }

  get highlightMode(): RawBlendMode | undefined {
    return this._rawValue?.highlightMode
  }

  get shadowMode(): RawBlendMode | undefined {
    return this._rawValue?.shadowMode
  }

  get enabled(): boolean {
    return this._rawValue?.enabled ?? true
  }
}
