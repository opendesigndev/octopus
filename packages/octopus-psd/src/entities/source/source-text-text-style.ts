import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import { SourceEntity } from './source-entity.js'
import { getTextColor } from '../../utils/text.js'

import type { RawTextStyle, RawStyleSheetData } from '../../typings/raw/index.js'
import type { SourceColor } from '../../typings/source.js'

export class SourceTextTextStyle extends SourceEntity {
  protected _rawValue: RawTextStyle | undefined
  private _defaultStyleSheet: RawStyleSheetData | undefined

  static FONT_CAPS_VALUES = ['smallCaps', 'allCaps'] as const

  constructor(raw: RawTextStyle | undefined, defaultStyleSheet: RawStyleSheetData | undefined) {
    super(raw)
    this._defaultStyleSheet = defaultStyleSheet
  }

  get fontPostScriptName(): string {
    return this._rawValue?.fontPostScriptName ?? ''
  }

  get fontName(): string | undefined {
    const fontName = this._rawValue?.fontName
    return fontName ? fontName.replace(/-+$/, '') : fontName
  }

  get fontStyleName(): string | undefined {
    return this._rawValue?.fontStyleName
  }

  get size(): number {
    return this._rawValue?.FontSize ?? this._defaultStyleSheet?.FontSize ?? 0
  }

  get lineHeight(): number {
    return round(this._rawValue?.Leading ?? 0, 1)
  }

  get letterSpacing(): number {
    const tracking = this._rawValue?.Tracking ?? 0
    return (tracking * this.size) / 1000
  }

  get kerning(): boolean {
    return true
  }

  get features(): [] {
    return []
  }

  get ligatures(): boolean {
    return this._rawValue?.Ligatures ?? true
  }

  //todo could not invoke this. assuming uppercase key as it is with other keys
  get altLigature(): boolean {
    return this._rawValue?.Altligature ?? false
  }

  get underline(): boolean {
    return this._rawValue?.Underline ?? false
  }

  get linethrough(): boolean {
    return this._rawValue?.Strikethrough ?? false
  }

  get letterCase(): 'allCaps' | 'smallCaps' | undefined {
    const fontCaps = this._rawValue?.FontCaps

    if (!fontCaps) {
      return undefined
    }

    return SourceTextTextStyle.FONT_CAPS_VALUES[fontCaps - 1]
  }

  get color(): SourceColor | null {
    if (this._rawValue?.FillColor?.Type !== 1) return null

    return getTextColor(this._rawValue?.FillColor?.Values)
  }
}
