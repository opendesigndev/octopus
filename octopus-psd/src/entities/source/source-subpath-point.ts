import type { RawSubpathPoint } from '../../typings/raw'
import { getPointFor } from '../../utils/source'

export class SourceSubpathPoint {
  protected _rawValue: RawSubpathPoint

  constructor(point: RawSubpathPoint) {
    this._rawValue = point
  }

  get anchor() {
    return getPointFor(this._rawValue?.anchor)
  }
  get backward() {
    return this._rawValue.backward ? getPointFor(this._rawValue?.backward) : undefined
  }
  get forward() {
    return this._rawValue.forward ? getPointFor(this._rawValue?.forward) : undefined
  }
}
