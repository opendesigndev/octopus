import type { RawShapeStrokeStyle } from '../../typings/raw'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEntity } from './source-entity'

export class SourceEffectStroke extends SourceEntity {
  protected _rawValue: RawShapeStrokeStyle | undefined

  constructor(stroke: RawShapeStrokeStyle | undefined) {
    super(stroke)
    this._rawValue = stroke
  }

  get fill() {
    return new SourceEffectFill(this._rawValue?.strokeStyleContent)
  }
}
