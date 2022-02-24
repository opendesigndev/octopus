import type {
  RawShapeStrokeStyle,
  RawStrokeStyleLineAlignment,
  RawStrokeStyleLineCapType,
  RawStrokeStyleLineJoinType,
} from '../../typings/raw'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEntity } from './source-entity'

export class SourceEffectStroke extends SourceEntity {
  protected _rawValue: RawShapeStrokeStyle | undefined

  constructor(stroke: RawShapeStrokeStyle | undefined) {
    super(stroke)
    this._rawValue = stroke
  }

  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue?.strokeStyleContent)
  }

  get lineWidth(): number {
    return this._rawValue?.strokeStyleLineWidth ?? 0
  }

  get lineAlignment(): RawStrokeStyleLineAlignment {
    return this._rawValue?.strokeStyleLineAlignment ?? 'strokeStyleAlignCenter'
  }

  get lineCap(): RawStrokeStyleLineCapType {
    return this._rawValue?.strokeStyleLineCapType ?? 'strokeStyleButtCap'
  }

  get lineJoin(): RawStrokeStyleLineJoinType {
    return this._rawValue?.strokeStyleLineJoinType ?? 'strokeStyleMiterJoin'
  }

  get lineDashSet(): number[] | undefined {
    return this._rawValue?.strokeStyleLineDashSet
  }

  get enabled(): boolean {
    return this._rawValue?.strokeEnabled ?? true
  }
}
