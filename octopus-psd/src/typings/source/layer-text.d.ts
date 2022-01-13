import type { RawLayerCommon } from './layer'
import type { RawParagraphStyle } from './style-paragraph'
import type { RawTextBounds } from './shared'
import type { RawTextStyle } from './style-text'

export type RawLayerText = RawLayerCommon & {
  type?: 'textLayer'
  text?: {
    TextIndex?: number
    boundingBox?: RawTextBounds
    bounds?: RawTextBounds
    orientation?: 'horizontal' | 'vertical'
    paragraphStyleRange?: RawParagraphStyle[]
    textKey?: string
    textStyleRange?: RawTextStyle[]
    transform?: {
      tx?: number
      ty?: number
      xx?: number
      xy?: number
      yx?: number
      yy?: number
    }
  }
}
