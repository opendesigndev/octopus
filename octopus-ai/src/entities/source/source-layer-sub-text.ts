import { round } from '@avocode/octopus-common/dist/utils/math'
import type { Nullable } from '@avocode/octopus-common/dist/utils/utility-types'

import type {
  RawGraphicsStateMatrix,
  RawResourcesFontTextFont,
  RawResourcesFontTextFontFontDescriptor,
  RawTextLayerText,
} from '../../typings/raw'
import type { RawGraphicsState } from '../../typings/raw/graphics-state'
import type SourceLayerText from './source-layer-text'

type SourceLayerTextNormalizedOptions = {
  parent: SourceLayerText
  rawValue: RawTextLayerText
}

export default class SourceLayerSubText {
  private _rawValue: RawTextLayerText
  private _parent: SourceLayerText
  static DEFAULT_TEXT_MATRIX = [1, 0, 0, 1, 0, 0] as RawGraphicsStateMatrix

  constructor(options: SourceLayerTextNormalizedOptions) {
    this._rawValue = options.rawValue
    this._parent = options.parent
  }

  get graphicsState(): Nullable<RawGraphicsState> {
    return this._rawValue.GraphicsState
  }

  get textTransformMatrix(): RawGraphicsStateMatrix {
    const rawCtm: RawGraphicsStateMatrix = this.textMatrix ?? SourceLayerSubText.DEFAULT_TEXT_MATRIX
    const fontSize = this.fontSize
    const clonedCtm = [...rawCtm]
    clonedCtm[0] = rawCtm[0] / fontSize
    clonedCtm[1] = -rawCtm[1] / fontSize
    clonedCtm[2] = -rawCtm[2] / fontSize
    clonedCtm[3] = rawCtm[3] / fontSize
    clonedCtm[5] = this._parent.parentArtboardHeight - rawCtm[5]

    return clonedCtm as RawGraphicsStateMatrix
  }

  get font(): Nullable<RawResourcesFontTextFont> {
    const fontId = this.graphicsState?.TextFont || ''
    const resources = this._parent.resources

    return resources?.getFontById(fontId)
  }

  get fontDescriptor(): Nullable<RawResourcesFontTextFontFontDescriptor> {
    return this.font?.FontDescriptor
  }

  get baseFont(): string {
    return this.font?.BaseFont ?? ''
  }

  get fontWeight(): Nullable<number> {
    return this.fontDescriptor?.FontWeight
  }

  get fontFamily(): Nullable<string> {
    return this.fontDescriptor?.FontFamily
  }

  get fontSize(): number {
    const [, , c, d] = this.textMatrix || SourceLayerSubText.DEFAULT_TEXT_MATRIX

    return round(Math.sqrt(c * c + d * d), 2)
  }

  get textMatrix(): Nullable<RawGraphicsStateMatrix> {
    return this._rawValue?.TextMatrix
  }

  get isItalic(): boolean {
    return (this.fontDescriptor ?? 0) !== 0
  }

  get textCharSpace(): number {
    return this.graphicsState?.TextCharSpace || 0
  }

  get parsedTextValue(): Nullable<string> {
    const stringOrArrayText = this._rawValue.Text

    return Array.isArray(stringOrArrayText)
      ? stringOrArrayText.filter((stringOrNum) => typeof stringOrNum === 'string').join('')
      : stringOrArrayText
  }

  get colorSpaceNonStroking(): Nullable<string> {
    return this.graphicsState?.ColorSpaceNonStroking
  }

  get colorNonStroking(): Nullable<number[]> {
    return this.graphicsState?.ColorNonStroking
  }

  get colorSpaceStroking(): Nullable<string> {
    return this.graphicsState?.ColorSpaceStroking
  }

  get colorStroking(): Nullable<number[]> {
    return this.graphicsState?.ColorStroking
  }

  get value(): string {
    const stringOrArr = this._rawValue.Text ?? ''

    if (typeof stringOrArr === 'string') {
      return stringOrArr
    }

    return stringOrArr.filter((stringOrNum) => typeof stringOrNum === 'string').join('')
  }
}
