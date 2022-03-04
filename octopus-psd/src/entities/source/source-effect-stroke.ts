import type { RawBlendMode, RawEffectStroke, RawEffectStrokeLineAlignment } from '../../typings/raw'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEntity } from './source-entity'

export class SourceEffectStroke extends SourceEntity {
  protected _rawValue: RawEffectStroke | undefined

  constructor(stroke: RawEffectStroke | undefined) {
    super(stroke)
    this._rawValue = stroke
  }

  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue)
  }

  get lineWidth(): number {
    return this._rawValue?.size ?? 0
  }

  get lineAlignment(): RawEffectStrokeLineAlignment {
    return this._rawValue?.style ?? 'centeredFrame'
  }

  get blendMode(): RawBlendMode | undefined {
    return this._rawValue?.mode
  }

  get enabled(): boolean {
    return this._rawValue?.enabled ?? true
  }
}
