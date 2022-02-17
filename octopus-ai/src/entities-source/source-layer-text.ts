import SourceLayerCommon from './source-layer-common'
import { RawTextLayer } from '../typings/source'
import { SourceLayerParent } from './source-layer-common'
import SourceLayerNormalizedText from './source-layer-text-normalized'
import { Nullable } from '../typings/helpers'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawTextLayer
  path: number[]
}

export default class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawTextLayer
  private _normalizedTexts: SourceLayerNormalizedText[]

  constructor(options: SourceLayerTextOptions) {
    super(options)
    this._normalizedTexts = this._initTexts()
  }

  private _initTexts() {
    return this._rawValue?.Texts.map((text) => new SourceLayerNormalizedText({ rawValue: text, parent: this._parent }))
  }

  get texts(): Nullable<SourceLayerNormalizedText[]> {
    return this._normalizedTexts
  }

  get textValue(): string {
    return this._normalizedTexts.reduce((text, textObj) => text + textObj.parsedTextValue, '')
  }

  get name(): string {
    if (!this.textValue) {
      return '<TextLayer>'
    }

    if (this.textValue.length < 100) {
      return this.textValue
    }

    return this.textValue.slice(0, 99)
  }
}
