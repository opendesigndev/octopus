import { flattenLayers, getChildren } from '../../utils/common-design.js'
import firstCallMemo from '../../utils/decorators.js'
import { Artboard } from './artboard.js'

import type { FigmaLayer, FigmaPage } from '../../types/figma.js'

type PageOptions = {
  page: FigmaPage
}

export class Page {
  private _page: FigmaPage

  static FRAME_LIKE_TYPES = ['FRAME', 'COMPONENT']

  constructor(options: PageOptions) {
    this._page = options.page
  }

  get id(): string {
    return String(this._page?.id)
  }

  get name(): string {
    return String(this._page?.name)
  }

  @firstCallMemo()
  get flatLayers(): FigmaLayer[] {
    return flattenLayers<FigmaLayer>(this._page)
  }

  @firstCallMemo()
  getTopLevelArtboards(): Artboard[] {
    return getChildren(this._page).reduce<Artboard[]>((artboards: Artboard[], node) => {
      if (node?.type === 'FRAME') artboards.push(new Artboard({ artboard: node }))
      return artboards
    }, [])
  }

  @firstCallMemo()
  getLocalComponents(): FigmaLayer[] {
    return this.flatLayers.filter((layer) => {
      return layer?.type === 'COMPONENT'
    })
  }

  @firstCallMemo()
  getAllFrameLikes(): FigmaLayer[] {
    return this.flatLayers.filter((layer) => {
      return Page.FRAME_LIKE_TYPES.includes(layer?.type as string)
    })
  }
}
