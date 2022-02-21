import type { RawGraphicsState } from '../typings/source/graphics-state'
import type { SourceLayerParent } from './source-layer-common'
import type { Nullable } from '../typings/helpers'
import type {
  RawResourcesFontTextFont,
  RawResourcesFontTextFontFontDescriptorFontFile3,
  RawTextLayerText,
} from '../typings/source'

type SourceLayerTextNormalizedOptions = {
  parent: SourceLayerParent
  rawValue: RawTextLayerText
}

export default class SourceLayerTextNormalized {
  private _rawValue: RawTextLayerText
  private _parent: SourceLayerParent

  constructor(options: SourceLayerTextNormalizedOptions) {
    this._rawValue = options.rawValue
    this._parent = options.parent
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    return this._rawValue.GraphicsState
  }

  //post script name or fontDict
  get font(): Nullable<RawResourcesFontTextFont> {
    const fontId = this.graphicsState?.TextFont || ''
    const resources = this._parent.resources

    return resources?.getFontById(fontId)
  }

  get fontDescriptor(): Nullable<RawResourcesFontTextFontFontDescriptorFontFile3> {
    return this.font?.FontDescriptor
  }

  get parsedTextValue(): Nullable<string> {
    const stringOrArrayText = this._rawValue.Text

    return Array.isArray(stringOrArrayText)
      ? stringOrArrayText.filter((stringOrNum) => typeof stringOrNum === 'string').join('')
      : stringOrArrayText
  }
}
