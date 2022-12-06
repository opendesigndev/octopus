import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'
import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { SourceEntity } from './source-entity.js'
import { SourceSubpathPoint } from './source-subpath-point.js'

import type { RawSourceSubpath } from '../../typings/source.js'

export class SourceSubpath extends SourceEntity {
  protected _rawValue: RawSourceSubpath

  constructor(raw: RawSourceSubpath) {
    super(raw)
  }

  @firstCallMemo()
  get points(): SourceSubpathPoint[] {
    const psdPoints = asArray(this._rawValue.points)
    return psdPoints.map((point) => new SourceSubpathPoint(point))
  }

  get closedSubpath(): boolean {
    return this._rawValue.closedSubpath === 0 ? true : false
  }
}
