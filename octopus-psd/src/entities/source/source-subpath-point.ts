import type { RawSubpathPoint } from '../../typings/raw'
import type { SourcePointXY } from '../../typings/source'
import { getPointFor } from '../../utils/source'

export class SourceSubpathPoint {
  private _rawValue: RawSubpathPoint

  constructor(point: RawSubpathPoint) {
    this._rawValue = point
  }

  get anchor(): SourcePointXY {
    return getPointFor(this._rawValue?.anchor)
  }
  get backward(): SourcePointXY | undefined {
    return this._rawValue.backward ? getPointFor(this._rawValue?.backward) : undefined
  }
  get forward(): SourcePointXY | undefined {
    return this._rawValue.forward ? getPointFor(this._rawValue?.forward) : undefined
  }
}
