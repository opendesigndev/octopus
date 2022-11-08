import type { RawStyle } from '.'
import type { RawGridStyle } from './grid'
import type { RawGuidesModel } from './guides'
import type { RawLayer } from './layer'

export type RawPasteboard = {
  version?: string
  children?: RawLayer[]
  resources?: {
    href?: string
  }
  artboards?: {
    href?: string
  }
}

export type RawArtboardEntry = {
  type?: 'artboard'
  id?: string
  meta?: {
    ux?: {
      guidesModel?: RawGuidesModel
      gridStyle?: RawGridStyle
    }
  }
  style?: RawStyle
  artboard?: {
    meta?: {
      ux?: {
        path?: string
      }
    }
    children?: RawLayer[]
    ref?: string
  }
}

export type RawArtboard = {
  version?: string
  children?: RawArtboardEntry[]
  resources?: {
    href?: string
  }
  artboards?: {
    href?: string
  }
}

export type RawArtboardLike = RawPasteboard | RawArtboard
