import type { RawColor } from './shared'

export type RawTextStyle = {
  from?: number
  textStyle?: {
    autoKerning?: boolean
    autoLeading?: boolean
    baselineDirection?: number
    baselineShift?: number
    characterDirection?: number
    color?: RawColor
    dLigatures?: boolean
    diacriticPos?: number
    fauxBold?: boolean
    fauxItalic?: boolean
    fillFirst?: boolean
    fillFlag?: boolean
    fontBaseline?: number
    fontName?: string
    fontPostScriptName?: string
    fontStyleName?: string
    hindiNumbers?: boolean
    horizontalScale?: number
    kashida?: number
    kerning?: number
    language?: number
    leading?: number
    ligatures?: boolean
    noBreak?: boolean
    outlineWidth?: number
    size?: number
    strikethrough?: boolean
    strokeColor?: {
      Type?: number
      Values?: number[]
    }
    strokeFlag?: boolean
    styleRunAlignment?: number
    tracking?: number
    tsume?: number
    underline?: boolean
    verticalScale?: number
    yUnderline?: number
  }
  to?: number
}
