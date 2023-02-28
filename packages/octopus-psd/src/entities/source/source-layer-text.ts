import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo.js'

import { SourceLayerCommon } from './source-layer-common.js'
import { SourceText } from './source-text.js'

import type { RawLayerText } from '../../typings/raw/index.js'
import type { SourceLayerParent } from './source-layer-common.js'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  declare _rawValue: RawLayerText

  constructor(options: SourceLayerTextOptions) {
    super(options)
  }

  @firstCallMemo()
  get text(): SourceText {
    return new SourceText(this._rawValue)
  }
}
