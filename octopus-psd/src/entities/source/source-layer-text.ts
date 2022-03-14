import type { RawLayerText } from '../../typings/raw'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { getBoundsFor } from '../../utils/source'
import type { SourceBounds } from '../../typings/source'
import { SourceText } from './source-text'
import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText
  protected _parent: SourceLayerParent

  constructor(options: SourceLayerTextOptions) {
    super()
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
