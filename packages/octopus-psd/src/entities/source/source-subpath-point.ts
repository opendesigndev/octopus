import { SourceEntity } from './source-entity.js'
import { getPointFor } from '../../utils/source.js'

import type { RawSubpathPoint } from '../../typings/raw/index.js'
import type { SourcePointXY } from '../../typings/source.js'

export class SourceSubpathPoint extends SourceEntity {
  declare _rawValue: RawSubpathPoint

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
