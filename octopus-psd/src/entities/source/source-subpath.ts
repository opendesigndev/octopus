import type { RawSubpath } from '../../typings/raw'
import { SourceSubpathPoint } from './source-subpath-point'

export class SourceSubpath {
  protected _subpath: RawSubpath

  constructor(subpath: RawSubpath) {
    this._subpath = subpath
  }

  get points() {
    return (this._subpath.points ?? []).map((point) => new SourceSubpathPoint(point))
  }

  get closedSubpath() {
    return this._subpath.closedSubpath ?? false
  }
}
