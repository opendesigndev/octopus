export type ParagraphRun = Partial<{
  IsJoinable: number
  RunLengthArray: number[]
  RunArray: ParagraphRunData[]
  DefaultRunData: ParagraphRunData
}>

export type ParagraphRunData = {
  Adjustments: ParagraphRunDataAdjustments
  ParagraphSheet: ParagraphRunDataParagraphSheet
}

export type ParagraphRunDataParagraphSheet = {
  Properties: ParagraphRunDataParagraphSheetProperties
}

export type ParagraphRunDataParagraphSheetProperties = {
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
}

export type ParagraphRunDataAdjustments = {
  XY: number[]
  Axis: number[]
}

export type RawParagraphStyleRange = {
  from: number
  paragraphStyle?: ParagraphRunDataParagraphSheetProperties
  to: number
}
