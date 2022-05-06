export type RawTextAlignHorizontal = 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED'
export type RawTextAlignVertical = 'TOP' | 'BOTTOM' | 'CENTER'

export type RawLineHeightUnit = 'INTRINSIC_%' // TODO

export type RawTextStyle = {
  fontFamily?: string
  fontPostScriptName?: null // TODO
  fontWeight?: number
  fontSize?: number
  textAlignHorizontal?: RawTextAlignHorizontal
  textAlignVertical?: RawTextAlignVertical
  letterSpacing?: number
  lineHeightPx?: number
  lineHeightPercent?: number
  lineHeightUnit?: RawLineHeightUnit
}
