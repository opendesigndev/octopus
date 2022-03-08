import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import type { RawLayerEffects } from '../../typings/raw'
import { convertScale } from '../../utils/convert'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEffectShadow } from './source-effect-shadow'
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

  @firstCallMemo()
  get solidFill(): SourceEffectFill | undefined {
    const fill = this._rawValue?.solidFill
    return fill !== undefined ? new SourceEffectFill(fill) : undefined
  }

  @firstCallMemo()
  get gradientFill(): SourceEffectFill | undefined {
    const fill = this._rawValue?.gradientFill
    return fill !== undefined ? new SourceEffectFill(fill) : undefined
  }

  @firstCallMemo()
  get patternFill(): SourceEffectFill | undefined {
    const fill = this._rawValue?.patternFill
    return fill !== undefined ? new SourceEffectFill(fill) : undefined
  }

  @firstCallMemo()
  get stroke(): SourceEffectStroke | undefined {
    const fill = this._rawValue?.frameFX
    return fill !== undefined ? new SourceEffectStroke(fill) : undefined
  }

  @firstCallMemo()
  get innerGlow(): SourceEffectShadow | undefined {
    const shadow = this._rawValue?.innerGlow
    return shadow !== undefined ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get innerShadow(): SourceEffectShadow | undefined {
    const shadow = this._rawValue?.innerShadow
    return shadow !== undefined ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get outerGlow(): SourceEffectShadow | undefined {
    const shadow = this._rawValue?.outerGlow
    return shadow !== undefined ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get dropShadow(): SourceEffectShadow | undefined {
    const shadow = this._rawValue?.dropShadow
    return shadow !== undefined ? new SourceEffectShadow(shadow) : undefined
  }

  @firstCallMemo()
  get satin(): SourceEffectStroke | undefined {
    const fill = this._rawValue?.chromeFX
    return fill !== undefined ? new SourceEffectStroke(fill) : undefined // TODO
  }

  @firstCallMemo()
  get bevelEmboss(): SourceEffectStroke | undefined {
    const fill = this._rawValue?.bevelEmboss
    return fill !== undefined ? new SourceEffectStroke(fill) : undefined // TODO
  }
}
