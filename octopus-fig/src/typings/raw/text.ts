import type { RawPaint } from './paint'

export type RawTextAlignHorizontal = 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED'

export type RawTextAlignVertical = 'TOP' | 'CENTER' | 'BOTTOM'

export type RawTextAutoResize = 'NONE' | 'HEIGHT' | 'WIDTH_AND_HEIGHT'

export type RawTextCase = 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED'

export type RawTextDecoration = 'NONE' | 'STRIKETHROUGH' | 'UNDERLINE'

export type RawLineHeightUnit = 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%'

export type RawTextStyle = {
  fontFamily?: string
  fontPostScriptName?: string | null
  fontWeight?: number
  fontSize?: number
  textAlignHorizontal?: RawTextAlignHorizontal
  textAlignVertical?: RawTextAlignVertical
  letterSpacing?: number
  opentypeFlags?: { [key: string]: number | undefined }
  lineHeightPx?: number
  lineHeightPercent?: number
  lineHeightPercentFontSize?: number
  lineHeightUnit?: RawLineHeightUnit
  paragraphSpacing?: number
  paragraphIndent?: number
  listSpacing?: number
  italic?: boolean
  textCase?: RawTextCase
  textDecoration?: RawTextDecoration
  textAutoResize?: RawTextAutoResize
  fills?: RawPaint[]
}
