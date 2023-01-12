import { SourceComponent } from './source-component'
import { SourceEntity } from './source-entity'

import type { RawPage, RawLayer, RawLayerContainer } from '../../typings/raw'

export class SourcePage extends SourceEntity {
  protected _rawValue: RawPage
  private _components: SourceComponent[]
  private _pasteboard: SourceComponent | null

  static DEFAULT_ID = 'page-1'

  constructor(raw: RawPage) {
    super(raw)
    const { components, pasteboard } = this._initComponents()
    this._components = components
    this._pasteboard = pasteboard
  }

  private _initPasteboard(children: RawLayer[]): SourceComponent | null {
    if (children.length === 0) return null
    const rawFrame = {
      ...this._rawValue,
      id: `${this.id}-pasteboard`,
      name: `${this.name}-pasteboard`,
      type: 'FRAME' as const,
      children,
    }
    return new SourceComponent({ rawFrame, isPasteboard: true })
  }

  private _initComponents(): { components: SourceComponent[]; pasteboard: SourceComponent | null } {
    const frames: RawLayerContainer[] = []
    const rest: RawLayer[] = []
    this._rawValue?.children?.forEach((element) => {
      if (element.type === 'FRAME' || element.type === 'COMPONENT' || element.type === 'COMPONENT_SET') {
        frames.push(element)
      } else {
        rest.push(element)
      }
    })
    const components = frames.map((rawFrame) => new SourceComponent({ rawFrame }))
    const pasteboard = this._initPasteboard(rest)
    return { components, pasteboard }
  }

  get raw(): RawPage {
    return this._rawValue
  }

  get components(): SourceComponent[] {
    return this._components
  }

  get pasteboard(): SourceComponent | null {
    return this._pasteboard
  }

  get children(): SourceComponent[] {
    return this.pasteboard ? [...this.components, this.pasteboard] : this.components
  }

  get id(): string {
    return this._rawValue.id ?? SourcePage.DEFAULT_ID
  }

  get name(): string {
    return this._rawValue.name ?? SourcePage.DEFAULT_ID
  }
}
