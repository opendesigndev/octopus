import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'
import type {
  RawShapeStrokeStyle,
  RawStrokeStyleLineAlignment,
  RawStrokeStyleLineCapType,
  RawStrokeStyleLineJoinType,
} from '../../typings/raw'
import { SourceEffectFill } from './source-effect-fill'
import { SourceEntity } from './source-entity'

export class SourceStroke extends SourceEntity {
  protected _rawValue: RawShapeStrokeStyle | undefined

  static DEFAULT_LINE_ALIGNMENT = 'strokeStyleAlignCenter' as const
  static DEFAULT_LINE_CAP = 'strokeStyleButtCap' as const
  static DEFAULT_LINE_JOIN = 'strokeStyleMiterJoin' as const

  constructor(stroke: RawShapeStrokeStyle | undefined) {
    super(stroke)
    this._rawValue = stroke
  }

  @firstCallMemo()
  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue?.strokeStyleContent)
  }

  get lineWidth(): number {
    return this._rawValue?.strokeStyleLineWidth ?? 0
  }

  get lineAlignment(): RawStrokeStyleLineAlignment {
    return this._rawValue?.strokeStyleLineAlignment ?? SourceStroke.DEFAULT_LINE_ALIGNMENT
  }

  get lineCap(): RawStrokeStyleLineCapType {
    return this._rawValue?.strokeStyleLineCapType ?? SourceStroke.DEFAULT_LINE_CAP
  }

  get lineJoin(): RawStrokeStyleLineJoinType {
    return this._rawValue?.strokeStyleLineJoinType ?? SourceStroke.DEFAULT_LINE_JOIN
  }

  get lineDashSet(): number[] | undefined {
    return this._rawValue?.strokeStyleLineDashSet
  }

  get enabled(): boolean {
    return this._rawValue?.strokeEnabled ?? true
  }
}
