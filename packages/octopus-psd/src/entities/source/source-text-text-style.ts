import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'
import { round } from '@opendesign/octopus-common/dist/utils/math.js'

import { DEFAULTS } from '../../utils/defaults.js'
import { SourceEntity } from './source-entity.js'

import type { RawTextStyle } from '../../typings/raw'
import type { SourceColor } from '../../typings/source'

export class SourceTextTextStyle extends SourceEntity {
  protected _rawValue: RawTextStyle | undefined

  static FONT_CAPS_VALUES = [undefined, 'smallCaps', 'allCaps'] as const

  constructor(raw: RawTextStyle | undefined) {
    super(raw)
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
    return this._rawValue?.FontSize ?? 0
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
    return SourceTextTextStyle.FONT_CAPS_VALUES[this._rawValue?.FontCaps ?? 0]
  }

  get color(): SourceColor | null {
    const colorArr = asArray(this._rawValue?.FillColor?.Values)
    const color = {
      r: (colorArr[1] ?? 0) * DEFAULTS.RGB_COLOR_MAX_VALUE,
      g: (colorArr[2] ?? 0) * DEFAULTS.RGB_COLOR_MAX_VALUE,
      b: (colorArr[3] ?? 0) * DEFAULTS.RGB_COLOR_MAX_VALUE,
    }
    return color
  }
}
