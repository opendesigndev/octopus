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

  get lineWidth() {
    return this._rawValue?.strokeStyleLineWidth ?? 0
  }

  get lineAlignment() {
    return this._rawValue?.strokeStyleLineAlignment ?? 'strokeStyleAlignCenter'
  }

  get lineCap() {
    return this._rawValue?.strokeStyleLineCapType ?? 'strokeStyleButtCap'
  }

  get lineJoin() {
    return this._rawValue?.strokeStyleLineJoinType ?? 'strokeStyleMiterJoin'
  }

  get lineDashSet() {
    return this._rawValue?.strokeStyleLineDashSet
  }
}
