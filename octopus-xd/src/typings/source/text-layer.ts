import type { RawLayerCommon } from './layer'
import type { RawStyle, RawTransform } from '.'

export type RawRangedStyle = {
  length?: number
  linkId?: string
  fontFamily?: string
  fontStyle?: string
  postscriptName?: string
  fontSize?: number
  charSpacing?: number
  underline?: boolean
  textTransform?: 'none' | 'lowercase' | 'uppercase' | 'titlecase'
  textScript?: 'none'
  fill?: {
    value?: number
  }
  strikethrough?: boolean
}

export type RawTextMeta = {
  ux?: {
    hasCustomName?: true
    singleTextObject?: true
    rangedStyles?: RawRangedStyle[]
    localTransform?: RawTransform
  }
}

export type RawTextParagraphRange = {
  x?: number
  y?: number
  from?: number
  to?: number
  style?: RawStyle
}

export type RawTextParagraph = {
  lines?: RawTextParagraphRange[][]
}

export type RawTextLayer = RawLayerCommon & {
  type?: 'text'
  meta?: RawTextMeta
  text?: {
    frame?: {
      type?: 'positioned' | 'autoHeight' | 'area'
      width?: number
      height?: number
    }
    paragraphs?: RawTextParagraph[]
    rawText?: string
  }
}
