import { firstCallMemo } from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { getBoundsFor } from '../../utils/source.js'
import { SourceLayerCommon } from './source-layer-common.js'
import { SourceText } from './source-text.js'

import type { RawLayerText } from '../../typings/raw/index.js'
import type { SourceBounds } from '../../typings/source.js'
import type { SourceLayerParent } from './source-layer-common.js'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText

  constructor(options: SourceLayerTextOptions) {
    super(options)
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
