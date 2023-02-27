export type RawTextStyleRange = Partial<{
  from: number
  textStyle: RawTextStyle
  to: number
  defaultStyleSheet: RawStyleSheetData
}>

export type RawStyleRun = Partial<{
  IsJoinable: number
  RunLengthArray: number[]
  RunArray: RawStyleRunArray[]
}>

export type RawStyleRunArray = {
  StyleSheet?: RawStyleRunArrayStyleSheet
}

export type RawStyleRunArrayStyleSheet = Partial<{
  StyleSheetData: RawStyleSheetData
}>

export type RawTextColor = Partial<{
  Values: number[]
  Type: number
}>

export type RawStyleSheetData = Partial<{
  Kashida: number
  HindiNumbers: boolean
  YUnderline: number
  StrokeColor: RawTextColor
  FillColor: RawTextColor
  NoBreak: boolean
  Language: number
  StyleRunAlignment: number
  Tsume: number
  BaselineDirection: number
  DLigatures: boolean
  Ligatures: boolean
  Strikethrough: boolean
  Underline: boolean
  FontBaseline: number
  FontCaps: number
  BaselineShift: number
  Kerning: number
  AutoKerning: boolean
  Tracking: number
  VerticalScale: number
  HorizontalScale: number
  Leading: number
  AutoLeading: boolean
  FauxItalic: boolean
  FauxBold: boolean
  FontSize: number
  Font: number
  Altligature: boolean
}>

export type RawTextStyle = RawStyleSheetData & RawFontProperties

export type RawFontProperties = Partial<{
  fontName: string
  fontPostScriptName: string
  fontStyleName: string
}>
