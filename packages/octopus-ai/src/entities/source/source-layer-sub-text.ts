import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import type { SourceLayerText } from './source-layer-text.js'
import type { RawGraphicsState } from '../../typings/raw/graphics-state.js'
import type {
  RawGraphicsStateMatrix,
  RawResourcesFontTextFont,
  RawResourcesFontTextFontFontDescriptor,
  RawTextLayerText,
} from '../../typings/raw/index.js'
import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

type SourceLayerTextNormalizedOptions = {
  parent: SourceLayerText
  rawValue: RawTextLayerText
}

export class SourceLayerSubText {
  private _rawValue: RawTextLayerText
  private _parent: SourceLayerText
  static DEFAULT_TEXT_MATRIX = [1, 0, 0, 1, 0, 0] as RawGraphicsStateMatrix

  constructor(options: SourceLayerTextNormalizedOptions) {
    this._rawValue = options.rawValue
    this._parent = options.parent
  }

  get graphicsState(): Nullish<RawGraphicsState> {
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

  get font(): Nullish<RawResourcesFontTextFont> {
    const fontId = this.graphicsState?.TextFont || ''
    const resources = this._parent.resources

    return resources?.getFontById(fontId)
  }

  get fontDescriptor(): Nullish<RawResourcesFontTextFontFontDescriptor> {
    return this.font?.FontDescriptor
  }

  get baseFont(): string {
    return this.font?.BaseFont ?? ''
  }

  get fontWeight(): Nullish<number> {
    return this.fontDescriptor?.FontWeight
  }

  get fontFamily(): Nullish<string> {
    return this.fontDescriptor?.FontFamily
  }

  get fontSize(): number {
    const [, , c, d] = this.textMatrix || SourceLayerSubText.DEFAULT_TEXT_MATRIX

    return round(Math.sqrt(c * c + d * d), 2)
  }

  get textMatrix(): Nullish<RawGraphicsStateMatrix> {
    return this._rawValue?.TextMatrix
  }

  get isItalic(): boolean {
    return (this.fontDescriptor ?? 0) !== 0
  }

  get textCharSpace(): number {
    return this.graphicsState?.TextCharSpace || 0
  }

  get parsedTextValue(): Nullish<string> {
    const stringOrArrayText = this._rawValue.Text

    return Array.isArray(stringOrArrayText)
      ? stringOrArrayText.filter((stringOrNum) => typeof stringOrNum === 'string').join('')
      : stringOrArrayText
  }

  get colorSpaceNonStroking(): Nullish<string> {
    return this.graphicsState?.ColorSpaceNonStroking
  }

  get colorNonStroking(): Nullish<number[]> {
    return this.graphicsState?.ColorNonStroking
  }

  get colorSpaceStroking(): Nullish<string> {
    return this.graphicsState?.ColorSpaceStroking
  }

  get colorStroking(): Nullish<number[]> {
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
