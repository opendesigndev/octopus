import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawSubpath } from '../../typings/raw'
import { SourceSubpathPoint } from './source-subpath-point'

export class SourceSubpath {
  private _rawValue: RawSubpath

  constructor(subpath: RawSubpath) {
    this._rawValue = subpath
  }

  @firstCallMemo()
  get points(): SourceSubpathPoint[] {
    return (this._rawValue.points ?? []).map((point) => new SourceSubpathPoint(point))
  }

  get closedSubpath(): boolean {
    return this._rawValue.closedSubpath ?? false
  }
}
