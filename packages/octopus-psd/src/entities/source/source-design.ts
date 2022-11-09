import { isArtboard } from '../../utils/source.js'
import { SourceComponent } from './source-component.js'

import type { RawComponent } from '../../typings/raw'

export type SourceImage = {
  name: string
  path: string
  width?: number
  height?: number
}

type SourceDesignOptions = {
  component: RawComponent
  images: SourceImage[]
  designId: string
}

export class SourceDesign {
  private _designId: string
  private _components: SourceComponent[]
  private _images: SourceImage[]

  constructor(options: SourceDesignOptions) {
    this._components = this._initComponents(options.component)
    this._images = options.images
    this._designId = options.designId
  }

  private _initComponents(raw: RawComponent): SourceComponent[] {
    if (raw.layers?.length === 1 && isArtboard(raw.layers[0]))
      return [new SourceComponent({ raw: { ...raw, ...raw.layers[0] } })] // no pasteboard for 1 artboard
    const components = [new SourceComponent({ raw, isPasteboard: true })]
    const artboards = raw.layers?.filter((layer) => isArtboard(layer)) ?? []
    artboards.forEach((artboard) => components.push(new SourceComponent({ raw: { ...raw, ...artboard } })))
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
}
