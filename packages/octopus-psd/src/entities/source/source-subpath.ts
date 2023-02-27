import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceEntity } from './source-entity.js'
import { SourceSubpathPoint } from './source-subpath-point.js'

import type { RawSubpath } from '../../typings/raw/index.js'

export class SourceSubpath extends SourceEntity {
  declare _rawValue: RawSubpath

  constructor(raw: RawSubpath) {
    super(raw)
  }

  @firstCallMemo()
  get points(): SourceSubpathPoint[] {
    return (this._rawValue.points ?? []).map((point) => new SourceSubpathPoint(point))
  }

  get closedSubpath(): boolean {
    return this._rawValue.closedSubpath ?? false
  }
}
