import { firstCallMemo } from '@opendesign/octopus-common/dist/decorators/first-call-memo'

import { SourceEntity } from './source-entity'
import { SourcePaint } from './source-paint'

import type {
  RawTextStyle,
  RawLineHeightUnit,
  RawTextAlignHorizontal,
  RawTextAlignVertical,
  RawTextAutoResize,
  RawTextCase,
  RawTextDecoration,
} from '../../typings/raw'

export class SourceTextStyle extends SourceEntity {
  protected _rawValue: RawTextStyle

  constructor(rawValue: RawTextStyle) {
    super(rawValue)
  }

  get fontFamily(): string | undefined {
    return this._rawValue.fontFamily
  }

  get fontPostScriptName(): string | undefined {
    return this._rawValue.fontPostScriptName ?? undefined
  }

  get fontStyle(): string | undefined {
    return this._rawValue.fontStyle
  }

  get fontWeight(): number | undefined {
    return this._rawValue.fontWeight ?? undefined
  }

  get fontSize(): number | undefined {
    return this._rawValue.fontSize ?? undefined
  }

  get textAlignHorizontal(): RawTextAlignHorizontal | undefined {
    return this._rawValue.textAlignHorizontal ?? undefined
  }

  get textAlignVertical(): RawTextAlignVertical | undefined {
    return this._rawValue.textAlignVertical ?? undefined
  }

  get letterSpacing(): number | undefined {
    return this._rawValue.letterSpacing ?? undefined
  }

  get lineHeightPx(): number | undefined {
    return this._rawValue.lineHeightPx ?? undefined
  }

  get lineHeightPercent(): number | undefined {
    return this._rawValue.lineHeightPercent ?? undefined
  }

  get lineHeightPercentFontSize(): number | undefined {
    return this._rawValue.lineHeightPercentFontSize ?? undefined
  }

  get lineHeightUnit(): RawLineHeightUnit | undefined {
    return this._rawValue.lineHeightUnit ?? undefined
  }

  get paragraphSpacing(): number | undefined {
    return this._rawValue.paragraphSpacing ?? undefined
  }

  get paragraphIndent(): number | undefined {
    return this._rawValue.paragraphIndent ?? undefined
  }

  get listSpacing(): number | undefined {
    return this._rawValue.listSpacing ?? undefined
  }

  get italic(): boolean | undefined {
    return this._rawValue.italic ?? undefined
  }

  get kerning(): boolean | undefined {
    const map = this._rawValue.opentypeFlags ?? {}
    const kerning = map['KERN']
    if (kerning === undefined) return undefined
    return kerning !== 0
  }

  get textCase(): RawTextCase | undefined {
    return this._rawValue.textCase
  }

  get textDecoration(): RawTextDecoration | undefined {
    return this._rawValue.textDecoration
  }

  get textAutoResize(): RawTextAutoResize | undefined {
    return this._rawValue.textAutoResize
  }

  @firstCallMemo()
  get textFills(): SourcePaint[] | undefined {
    return this._rawValue.fills?.map((paint) => new SourcePaint({ rawValue: paint }))
  }
}
