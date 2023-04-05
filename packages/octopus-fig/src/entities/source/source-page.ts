import { SourceArtboard } from './source-artboard.js'
import { SourceEntity } from './source-entity.js'

import type { RawPage, RawLayer, RawLayerContainer } from '../../typings/raw/index.js'

export class SourcePage extends SourceEntity {
  declare _rawValue: RawPage
  private _components: SourceArtboard[]
  private _pasteboard: SourceArtboard | null

  static DEFAULT_ID = 'page-1'

  constructor(raw: RawPage) {
    super(raw)
    const { components, pasteboard } = this._initComponents()
    this._components = components
    this._pasteboard = pasteboard
  }

  private _initPasteboard(children: RawLayer[]): SourceArtboard | null {
    if (children.length === 0) return null
    const rawFrame = {
      ...this._rawValue,
      id: `${this.id}-pasteboard`,
      name: `${this.name}-pasteboard`,
      type: 'FRAME' as const,
      children,
    }
    return new SourceArtboard({ rawFrame, isPasteboard: true })
  }

  private _initComponents(): { components: SourceArtboard[]; pasteboard: SourceArtboard | null } {
    const frames: RawLayerContainer[] = []
    const rest: RawLayer[] = []
    this._rawValue?.children?.forEach((element) => {
      if (element.type === 'FRAME' || element.type === 'COMPONENT' || element.type === 'COMPONENT_SET') {
        frames.push(element)
      } else {
        rest.push(element)
      }
    })
    const components = frames.map((rawFrame) => new SourceArtboard({ rawFrame }))
    const pasteboard = this._initPasteboard(rest)
    return { components, pasteboard }
  }

  get raw(): RawPage {
    return this._rawValue
  }

  get components(): SourceArtboard[] {
    return this._components
  }

  get pasteboard(): SourceArtboard | null {
    return this._pasteboard
  }

  get children(): SourceArtboard[] {
    return this.pasteboard ? [...this.components, this.pasteboard] : this.components
  }

  get id(): string {
    return this._rawValue.id ?? SourcePage.DEFAULT_ID
  }

  get name(): string {
    return this._rawValue.name ?? SourcePage.DEFAULT_ID
  }
}
