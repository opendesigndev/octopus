import type { RawSubpathPoint } from '../../typings/raw'
import { getPointFor } from '../../utils/source'

export class SourceSubpathPoint {
  protected _point: RawSubpathPoint

  constructor(point: RawSubpathPoint) {
    this._point = point
  }

  get anchor() {
    return getPointFor(this._point?.anchor)
  }
  get backward() {
    return this._point.backward ? getPointFor(this._point?.backward) : undefined
  }
  get forward() {
    return this._point.forward ? getPointFor(this._point?.forward) : undefined
  }
}
