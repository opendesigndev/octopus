import type { RawLayerEffect } from '../../typings/raw'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEntity } from './source-entity'

export class SourceLayerEffect extends SourceEntity {
  protected _rawValue: RawLayerEffect | undefined

  constructor(effect: RawLayerEffect | undefined) {
    super(effect)
    this._rawValue = effect
  }

  get scale(): number {
    return (this._rawValue?.scale?.value ?? 100) / 100
  }

  get patternFill(): SourceEffectFill | undefined {
    return new SourceEffectFill(this._rawValue?.patternFill)
  }
}
