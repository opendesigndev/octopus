import type { RawSubpath } from '../../typings/raw'
import { SourceSubpathPoint } from './source-subpath-point'

export class SourceSubpath {
  protected _rawValue: RawSubpath

  constructor(subpath: RawSubpath) {
    this._rawValue = subpath
  }

  get points() {
    return (this._rawValue.points ?? []).map((point) => new SourceSubpathPoint(point))
  }

  get closedSubpath() {
    return this._rawValue.closedSubpath ?? false
  }
}
