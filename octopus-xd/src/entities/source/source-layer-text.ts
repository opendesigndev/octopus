import { SourceLayerCommon } from './source-layer-common'

import type { Defined } from '../../typings/helpers'
import type { RawTextLayer } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawTextLayer
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawTextLayer
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerTextOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  get textValue(): Defined<RawTextLayer['text']>['rawText'] {
    return this._rawValue?.text?.rawText
  }

  get attributes(): Defined<RawTextLayer['style']>['textAttributes'] {
    return this._rawValue?.style?.textAttributes
  }

  get raw(): RawTextLayer {
    return this._rawValue
  }
}
