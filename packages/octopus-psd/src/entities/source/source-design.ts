import { SourceComponent } from './source-component.js'
import { isArtboard } from '../../utils/source.js'

import type { RawParsedPsd } from '../../typings/raw/component.js'

export type SourceImage = {
  name: string
  data: Uint8Array
  width?: number
  height?: number
}

type SourceDesignOptions = {
  component: RawParsedPsd
  images: SourceImage[]
  designId: string
  componentIds?: number[]
  iccProfileName?: string
}

export class SourceDesign {
  private _designId: string
  private _components: SourceComponent[]
  private _images: SourceImage[]
  private _raw: RawParsedPsd
  private _iccProfileName: string | undefined

  constructor(options: SourceDesignOptions) {
    this._components = this._initComponents(options.component, options.componentIds)
    this._images = options.images
    this._designId = options.designId
    this._raw = options.component
    this._iccProfileName = options.iccProfileName
  }

  private _initComponents(raw: RawParsedPsd, componentIds?: number[]): SourceComponent[] {
    if (raw.children?.length === 1 && isArtboard(raw.children[0]) && !componentIds) {
      return [new SourceComponent({ raw: raw.children[0], parent: this })] // no pasteboard for 1 artboard
    }

    const components = componentIds ? [] : [new SourceComponent({ raw, isPasteboard: true, parent: this })]
    const artboards = raw.children.filter((psdNode) => {
      const componentId = psdNode.additionalProperties?.lyid?.value
      const isInComponentIds = componentIds ? componentId && componentIds.includes(componentId) : true

      return isArtboard(psdNode) && isInComponentIds
    })

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

  get iccProfileName(): string | undefined {
    return this._iccProfileName
  }
}
