import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawSubpath } from '../../typings/raw'
import { SourceEntity } from './source-entity'
import { SourceSubpathPoint } from './source-subpath-point'

export class SourceSubpath extends SourceEntity {
  protected _rawValue: RawSubpath

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
