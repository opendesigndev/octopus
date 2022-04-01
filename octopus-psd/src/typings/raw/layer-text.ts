import type { RawLayerCommon } from './layer'
import type { RawBounds, RawMatrix, RawTextBounds } from './shared'
import type { RawParagraphStyleRange } from './style-paragraph'
import type { RawTextStyleRange } from './style-text'

export type RawText = {
  TextIndex?: number
  boundingBox?: RawTextBounds
  bounds?: RawTextBounds
  orientation?: 'horizontal' | 'vertical'
  paragraphStyleRange?: RawParagraphStyleRange[]
  textKey?: string
  textStyleRange?: RawTextStyleRange[]
  transform?: RawMatrix
}

export type RawLayerText = RawLayerCommon & {
  type?: 'textLayer'
  bitmapBounds?: RawBounds
  text?: RawText
}
