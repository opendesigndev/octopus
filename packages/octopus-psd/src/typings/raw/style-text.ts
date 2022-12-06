export type RawTextStyleRange = {
  from?: number
  textStyle?: RawTextStyle
  to?: number
}

export type StyleRun = Partial<{
  IsJoinable: number
  RunLengthArray: number[]
  RunArray: StyleRunArray[]
}>

export type StyleRunArray = {
  StyleSheet?: StyleRunArrayStyleSheet
}

export type StyleRunArrayStyleSheet = Partial<{
  StyleSheetData: StyleRunArrayStyleSheetStyleSheetData
}>

export type TextColor = Partial<{
  Values: number[]
  Type: number
}>

export type StyleRunArrayStyleSheetStyleSheetData = Partial<{
  Kashida: number
  HindiNumbers: boolean
  YUnderline: number
  StrokeColor: TextColor
  FillColor: TextColor
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

export type RawTextStyle = StyleRunArrayStyleSheetStyleSheetData & FontProperties

export type FontProperties = {
  fontName: string
  fontPostScriptName: string
  fontStyleName: string
}
