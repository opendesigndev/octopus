import type { RawSubpath } from '../../typings/raw'
import { SourceSubpathPoint } from './source-subpath-point'

export class SourceSubpath {
  protected _rawValue: RawSubpath

  constructor(subpath: RawSubpath) {
    this._rawValue = subpath
  }

  get points(): SourceSubpathPoint[] {
    return (this._rawValue.points ?? []).map((point) => new SourceSubpathPoint(point))
  }

  get closedSubpath(): boolean {
    return this._rawValue.closedSubpath ?? false
  }
}
