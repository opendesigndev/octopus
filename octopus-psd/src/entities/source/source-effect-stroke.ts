import type { RawShapeStrokeStyle } from '../../typings/raw'
import { SourceEffectFill } from './source-effect-fill'

export class SourceEffectStroke {
  protected _rawValue: RawShapeStrokeStyle | undefined

  constructor(stroke: RawShapeStrokeStyle | undefined) {
    this._rawValue = stroke
  }

  get fill() {
    return new SourceEffectFill(this._rawValue?.strokeStyleContent)
  }

  // TODO remove in the end
  get RAW() {
    return this._rawValue
  }
}
