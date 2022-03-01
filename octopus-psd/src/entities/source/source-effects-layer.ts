import type { RawLayerEffect } from '../../typings/raw'
import { convertScale } from '../../utils/convert'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEntity } from './source-entity'

export class SourceLayerEffects extends SourceEntity {
  protected _rawValue: RawLayerEffect | undefined

  constructor(effect: RawLayerEffect | undefined) {
    super(effect)
    this._rawValue = effect
  }

  get scale(): number {
    return convertScale(this._rawValue?.scale?.value)
  }

  get enabledAll(): boolean {
    return this._rawValue?.masterFXSwitch ?? false
  }

  get solidFill(): SourceEffectFill | undefined {
    return new SourceEffectFill(this._rawValue?.solidFill)
  }

  get gradientFill(): SourceEffectFill | undefined {
    return new SourceEffectFill(this._rawValue?.gradientFill)
  }

  get patternFill(): SourceEffectFill | undefined {
    return new SourceEffectFill(this._rawValue?.patternFill)
  }
}
