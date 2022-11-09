import { getSizeFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

import type { Octopus } from '../../typings/octopus'
import type { RawBlendMode, RawColor, RawEffect, RawEffectType } from '../../typings/raw'

export class SourceEffect extends SourceEntity {
  protected _rawValue: RawEffect | undefined

  constructor(raw: RawEffect | undefined) {
    super(raw)
  }

  get type(): RawEffectType | undefined {
    return this._rawValue?.type
  }

  get visible(): boolean {
    return this._rawValue?.visible ?? true
  }

  get radius(): number {
    return this._rawValue?.radius ?? 0
  }

  get color(): RawColor | undefined {
    return this._rawValue?.color
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue?.blendMode
  }

  get offset(): Octopus['Vec2'] | null {
    return getSizeFor(this._rawValue?.offset)
  }

  get spread(): number {
    return this._rawValue?.spread ?? 0
  }

  get showShadowBehindNode(): boolean {
    return this._rawValue?.showShadowBehindNode ?? false
  }
}
