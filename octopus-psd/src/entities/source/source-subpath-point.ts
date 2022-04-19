import { getPointFor } from '../../utils/source'
import { SourceEntity } from './source-entity'

import type { RawSubpathPoint } from '../../typings/raw'
import type { SourcePointXY } from '../../typings/source'

export class SourceSubpathPoint extends SourceEntity {
  protected _rawValue: RawSubpathPoint

  constructor(raw: RawSubpathPoint) {
    super(raw)
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
