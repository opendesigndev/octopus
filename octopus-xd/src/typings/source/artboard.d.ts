import { RawGridStyle } from './grid'
import { RawGuidesModel } from './guides'
import { RawLayer } from './layer'

export type RawArtboardEntry = {
  type?: 'artboard',
  id?: string,
  meta?: {
    ux?: {
      guidesModel?: RawGuidesModel,
      gridStyle?: RawGridStyle
    }
  },
  artboard?: {
    meta?: {
      ux?: {
        path?: string
      }
    },
    children?: RawLayer[],
    ref?: string
  }
}
export type RawArtboard = {
  children?: RawArtboardEntry[]
}