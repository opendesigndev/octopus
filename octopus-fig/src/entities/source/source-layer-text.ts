import firstCallMemo from '@avocode/octopus-common/dist/decorators/first-call-memo'

import { DEFAULTS } from '../../utils/defaults'
import { SourceLayerCommon } from './source-layer-common'
import { SourcePaint } from './source-paint'

import type {
  RawLayerText,
  RawLineHeightUnit,
  RawTextAlignHorizontal,
  RawTextAlignVertical,
  RawTextAutoResize,
  RawTextCase,
  RawTextDecoration,
} from '../../typings/raw'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerTextOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerText
}

export class SourceLayerText extends SourceLayerCommon {
  protected _rawValue: RawLayerText

  constructor(options: SourceLayerTextOptions) {
    super(options)
  }

  get type(): 'TEXT' {
    return 'TEXT'
  }

  get characters(): string {
    return this._rawValue.characters ?? ''
  }

  get layoutVersion(): number | undefined {
    return this._rawValue.layoutVersion
  }

  get characterStyleOverrides(): number[] {
    return this._rawValue.characterStyleOverrides ?? []
  }

  get fontFamily(): string | undefined {
    return this._rawValue.style?.fontFamily
  }

  get fontPostScriptName(): string | null {
    return this._rawValue.style?.fontPostScriptName ?? null
  }

  get fontWeight(): number {
    return this._rawValue.style?.fontWeight ?? DEFAULTS.TEXT.FONT_WEIGHT
  }

  get fontSize(): number {
    return this._rawValue.style?.fontSize ?? DEFAULTS.TEXT.FONT_SIZE
  }

  get textAlignHorizontal(): RawTextAlignHorizontal {
    return this._rawValue.style?.textAlignHorizontal ?? 'LEFT'
  }

  get textAlignVertical(): RawTextAlignVertical {
    return this._rawValue.style?.textAlignVertical ?? 'TOP'
  }

  get letterSpacing(): number {
    return this._rawValue.style?.letterSpacing ?? DEFAULTS.TEXT.LETTER_SPACING
  }

  get lineHeightPx(): number {
    return this._rawValue.style?.lineHeightPx ?? 0
  }

  get lineHeightPercent(): number {
    return this._rawValue.style?.lineHeightPercent ?? DEFAULTS.TEXT.LINE_HEIGHT_PERCENT
  }

  get lineHeightPercentFontSize(): number {
    return this._rawValue.style?.lineHeightPercentFontSize ?? 0
  }

  get lineHeightUnit(): RawLineHeightUnit {
    return this._rawValue.style?.lineHeightUnit ?? DEFAULTS.TEXT.LINE_HEIGHT_UNIT
  }

  get paragraphSpacing(): number {
    return this._rawValue.style?.paragraphSpacing ?? 0
  }

  get paragraphIndent(): number {
    return this._rawValue.style?.paragraphIndent ?? 0
  }

  get listSpacing(): number {
    return this._rawValue.style?.listSpacing ?? 0
  }

  get italic(): boolean {
    return this._rawValue.style?.italic ?? false
  }

  get textCase(): RawTextCase {
    return this._rawValue.style?.textCase ?? 'ORIGINAL'
  }

  get textDecoration(): RawTextDecoration {
    return this._rawValue.style?.textDecoration ?? 'NONE'
  }

  get textAutoResize(): RawTextAutoResize {
    return this._rawValue.style?.textAutoResize ?? 'NONE'
  }

  @firstCallMemo()
  get textFills(): SourcePaint[] {
    return this._rawValue.style?.fills?.map((paint) => new SourcePaint({ rawValue: paint })) ?? []
  }
}
