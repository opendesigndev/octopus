import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { getBoundsFor } from '../../utils/source.js'
import { SourceLayerCommon } from './source-layer-common.js'
import { SourceText } from './source-text.js'

import type { RawLayerText } from '../../typings/raw'
import type { SourceBounds } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'

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
