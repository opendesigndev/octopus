import type { RawLayerEffects } from '../../typings/raw'
import { convertScale } from '../../utils/convert'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEffectStroke } from './source-effect-stroke'
import { SourceEntity } from './source-entity'

export class SourceLayerEffects extends SourceEntity {
  protected _rawValue: RawLayerEffects | undefined

  constructor(effects: RawLayerEffects | undefined) {
    super(effects)
    this._rawValue = effects
  }

  get scale(): number {
    return convertScale(this._rawValue?.scale?.value)
  }

  get enabledAll(): boolean {
    return this._rawValue?.masterFXSwitch ?? false
  }

  get solidFill(): SourceEffectFill | undefined {
    const fill = this._rawValue?.solidFill
    return fill !== undefined ? new SourceEffectFill(fill) : undefined
  }

  get gradientFill(): SourceEffectFill | undefined {
    const fill = this._rawValue?.gradientFill
    return fill !== undefined ? new SourceEffectFill(fill) : undefined
  }

  get patternFill(): SourceEffectFill | undefined {
    const fill = this._rawValue?.patternFill
    return fill !== undefined ? new SourceEffectFill(fill) : undefined
  }

  get stroke(): SourceEffectStroke | undefined {
    const fill = this._rawValue?.frameFX
    return fill !== undefined ? new SourceEffectStroke(fill) : undefined
  }
}
