export type RawParagraphRun = Partial<{
  IsJoinable: number
  RunLengthArray: number[]
  RunArray: RawParagraphRunData[]
  DefaultRunData: RawParagraphRunData
}>

export type RawParagraphRunData = {
  Adjustments: RawParagraphRunDataAdjustments
  ParagraphSheet: RawParagraphRunDataParagraphSheet
}

export type RawParagraphRunDataParagraphSheet = Partial<{
  Properties: RawParagraphRunDataParagraphSheetProperties
}>

export type RawParagraphRunDataParagraphSheetProperties = Partial<{
  EveryLineComposer: boolean
  KinsokuOrder: number
  Burasagari: boolean
  Hanging: boolean
  LeadingType: number
  AutoLeading: number
  GlyphSpacing: number[]
  LetterSpacing: number[]
  WordSpacing: number[]
  Zone: number
  ConsecutiveHyphens: number
  PostHyphen: number
  PreHyphen: number
  HyphenatedWordSize: number
  AutoHyphenate: boolean
  SpaceAfter: number
  SpaceBefore: number
  EndIndent: number
  StartIndent: number
  FirstLineIndent: number
  Justification: number
}>

export type RawParagraphRunDataAdjustments = Partial<{
  XY: number[]
  Axis: number[]
}>

export type RawParagraphStyleRange = {
  from: number
  paragraphStyle?: RawParagraphRunDataParagraphSheetProperties
  to: number
}
