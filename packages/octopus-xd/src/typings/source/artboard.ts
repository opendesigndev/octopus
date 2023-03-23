import type { RawGridStyle } from './grid.js'
import type { RawGuidesModel } from './guides.js'
import type { RawStyle } from './index.js'
import type { RawLayer } from './layer.js'

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
