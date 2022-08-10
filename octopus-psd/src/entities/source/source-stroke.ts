import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { SourceEffectFill } from './source-effect-fill.js'
import { SourceEntity } from './source-entity.js'

import type {
  RawShapeStrokeStyle,
  RawStrokeStyleLineAlignment,
  RawStrokeStyleLineCapType,
  RawStrokeStyleLineJoinType,
} from '../../typings/raw/index.js'

export class SourceStroke extends SourceEntity {
  protected _rawValue: RawShapeStrokeStyle | undefined

  static DEFAULT_LINE_ALIGNMENT = 'strokeStyleAlignCenter' as const
  static DEFAULT_LINE_CAP = 'strokeStyleButtCap' as const
  static DEFAULT_LINE_JOIN = 'strokeStyleMiterJoin' as const

  constructor(raw: RawShapeStrokeStyle | undefined) {
    super(raw)
  }

  @firstCallMemo()
  get fill(): SourceEffectFill {
    return new SourceEffectFill(this._rawValue?.strokeStyleContent)
  }

  get lineWidth(): number {
    const lineWidth = this._rawValue?.strokeStyleLineWidth
    if (typeof lineWidth === 'number') return lineWidth
    return lineWidth?.value ?? 0
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
