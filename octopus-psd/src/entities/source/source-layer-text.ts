import type { RawLayerText } from '../../typings/raw'
import { SourceLayerCommon } from './source-layer-common'
import type { SourceLayerParent } from './source-layer-common'
import { getBoundsFor, getMatrixFor } from '../../utils/source'
import type { SourceBounds, SourceMatrix } from '../../typings/source'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

type SourceLayerTextType = RawLayerText['text'] & { orientation: 'horizontal' | 'vertical'; transform: SourceMatrix }

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText
  protected _parent: SourceLayerParent

  static DEFAULT_ORIENTATION = 'horizontal' as const

  constructor(options: SourceLayerTextOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
  }

  get bitmapBounds(): SourceBounds {
    return getBoundsFor(this._rawValue.bitmapBounds)
  }

  get text(): SourceLayerTextType {
    const text = this._rawValue.text
    return {
      ...text,
      orientation: text?.orientation ?? SourceLayerText.DEFAULT_ORIENTATION,
      transform: getMatrixFor(text?.transform),
    }
  }
}
