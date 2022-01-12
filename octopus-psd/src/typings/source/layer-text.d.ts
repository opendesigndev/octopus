import { RawLayerCommon } from './layer'
import { RawParagraphStyle } from './style-paragraph'
import { RawTextBounds } from './shared'
import { RawTextStyle } from './style-text'

export type RawLayerText = RawLayerCommon & {
  type?: 'textLayer'
  text?: {
    TextIndex?: number
    boundingBox?: RawTextBounds
    bounds?: RawTextBounds
    orientation?: 'horizontal' | 'vertical'
    paragraphStyleRange?: [RawParagraphStyle]
    textKey?: string
    textStyleRange?: [RawTextStyle]
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
