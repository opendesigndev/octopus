import type { RawLayerCommon } from './layer'
import type { RawParagraphStyleRange } from './style-paragraph'
import type { RawBounds, RawTextBounds } from './shared'
import type { RawTextStyleRange } from './style-text'

export type RawTextTransform = {
  tx?: number
  ty?: number
  xx?: number
  xy?: number
  yx?: number
  yy?: number
}

export type RawLayerText = RawLayerCommon & {
  type?: 'textLayer'
  bitmapBounds?: RawBounds
  text?: {
    TextIndex?: number
    boundingBox?: RawTextBounds
    bounds?: RawTextBounds
    orientation?: 'horizontal' | 'vertical'
    paragraphStyleRange?: RawParagraphStyleRange[]
    textKey?: string
    textStyleRange?: RawTextStyleRange[]
    transform?: RawTextTransform
  }
}
