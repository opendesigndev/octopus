import { isArtboard } from '../../utils/source.js'
import { SourceComponent } from './source-component.js'

import type { ParsedPsd } from '../../typings/raw/component.js'

export type SourceImage = {
  name: string
  path: string
  width?: number
  height?: number
}

type SourceDesignOptions = {
  component: ParsedPsd
  images: SourceImage[]
  designId: string
}

export class SourceDesign {
  private _designId: string
  private _components: SourceComponent[]
  private _images: SourceImage[]
  private _raw: ParsedPsd

  constructor(options: SourceDesignOptions) {
    this._components = this._initComponents(options.component)
    this._images = options.images
    this._designId = options.designId
    this._raw = options.component
  }

  private _initComponents(raw: ParsedPsd): SourceComponent[] {
    if (raw.children?.length === 1 && isArtboard(raw.children[0])) {
      return [new SourceComponent({ raw: raw.children[0], parent: this })] // no pasteboard for 1 artboard
    }

    const components = [new SourceComponent({ raw, isPasteboard: true, parent: this })]
    const artboards = raw.children.filter((psdNode) => isArtboard(psdNode))

    artboards.forEach((artboard) =>
      components.push(
        new SourceComponent({
          parent: this,
          raw: artboard,
        })
      )
    )

    return components
  }

  get designId(): string {
    return this._designId
  }

  get components(): SourceComponent[] {
    return this._components
  }

  get componentIds(): string[] {
    return this._components.map((comp) => comp.id)
  }

  get images(): SourceImage[] {
    return this._images
  }

  getComponentById(id: string): SourceComponent | undefined {
    return this.components.find((comp) => comp.id === id)
  }

  getImageByName(name: string): SourceImage | undefined {
    return this.images.find((image) => image.name === name)
  }

  get documentWidth(): number {
    return this._raw.width
  }

  get documentHeight(): number {
    return this._raw.height
  }
}
