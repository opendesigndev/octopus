import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import type { RawLayerText } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'
import { getBoundsFor } from '../../utils/source'
import type { SourceLayerParent } from './source-layer-common'
import { SourceLayerCommon } from './source-layer-common'
import { SourceText } from './source-text'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerTextOptions) {
    super(options)
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  @firstCallMemo()
  get bitmapBounds(): SourceBounds {
    return getBoundsFor(this._rawValue.bitmapBounds)
  }

  @firstCallMemo()
  get text(): SourceText {
    return new SourceText(this._rawValue.text)
  }
}
