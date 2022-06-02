import { convertId } from '../../utils/convert'
import { SourceArtboard } from './source-artboard'
import { SourceEntity } from './source-entity'

import type { RawPage, RawLayer, RawLayerFrame } from '../../typings/raw'

export class SourcePage extends SourceEntity {
  protected _rawValue: RawPage
  private _artboards: SourceArtboard[]
  private _pasteboard: SourceArtboard | null

  static DEFAULT_ID = 'page-1'

  constructor(raw: RawPage) {
    super(raw)
    const { artboards, pasteboard } = this._initArtboards()
    this._artboards = artboards
    this._pasteboard = pasteboard
  }

  private _initPasteboard(children: RawLayer[]): SourceArtboard | null {
    if (children.length === 0) return null
    const IS_PASTEBOARD = true
    return new SourceArtboard(
      {
        ...this._rawValue,
        id: `${this.id}-pasteboard`,
        name: `${this.name}-pasteboard`,
        type: 'FRAME',
        children,
      },
      IS_PASTEBOARD
    )
  }

  private _initArtboards(): { artboards: SourceArtboard[]; pasteboard: SourceArtboard | null } {
    const frames: RawLayerFrame[] = []
    const rest: RawLayer[] = []
    this._rawValue?.children?.forEach((element) => {
      if (element.type === 'FRAME') {
        frames.push(element)
      } else {
        rest.push(element)
      }
    })
    const artboards = frames.map((frame) => new SourceArtboard(frame))
    const pasteboard = this._initPasteboard(rest)
    return { artboards, pasteboard }
  }

  get raw(): RawPage {
    return this._rawValue
  }

  get artboards(): SourceArtboard[] {
    return this._artboards
  }

  get pasteboard(): SourceArtboard | null {
    return this._pasteboard
  }

  get children(): SourceArtboard[] {
    return this.pasteboard ? [...this.artboards, this.pasteboard] : this.artboards
  }

  get id(): string {
    return convertId(this._rawValue.id ?? SourcePage.DEFAULT_ID)
  }

  get name(): string {
    return this._rawValue.name ?? SourcePage.DEFAULT_ID
  }
}
