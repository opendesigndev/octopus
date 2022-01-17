export type RawParagraphStyle = {
  AutoHyphenate?: boolean
  AutoLeading?: number
  Burasagari?: boolean
  ConsecutiveHyphens?: number
  EndIndent?: number
  EveryLineComposer?: boolean
  FirstLineIndent?: number
  GlyphSpacing?: number[]
  Hanging?: boolean
  HyphenatedWordSize?: number
  KinsokuOrder?: number
  LeadingType?: number
  LetterSpacing?: number[]
  PostHyphen?: number
  PreHyphen?: number
  SpaceAfter?: number
  SpaceBefore?: number
  StartIndent?: number
  WordSpacing?: number[]
  Zone?: number
  align?: 'center' | 'right' | 'left'
}

export type RawParagraphStyleRange = {
  from?: number
  paragraphStyle?: RawParagraphStyle
  to?: number
}
