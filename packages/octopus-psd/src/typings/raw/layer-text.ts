import type { RawLayerCommon } from './layer.js'
import type { RawBounds, RawMatrix, RawTextBounds } from './shared.js'
import type { RawParagraphStyleRange } from './style-paragraph.js'
import type { RawTextStyleRange } from './style-text.js'

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
