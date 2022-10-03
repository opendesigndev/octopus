import { SourceComponent } from './source-component'

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
  private _component: SourceComponent
  private _images: SourceImage[]

  constructor(options: SourceDesignOptions) {
    this._component = new SourceComponent(options.component)
    this._images = options.images
    this._designId = options.designId
  }

  get designId(): string {
    return this._designId
  }

  get component(): SourceComponent {
    return this._component
  }

  get images(): SourceImage[] {
    return this._images
  }

  getImageByName(name: string): SourceImage | undefined {
    return this.images.find((image) => image.name === name)
  }

  get values(): {
    designId: string
    component: RawComponent
    images: SourceImage[]
  } {
    return {
      designId: this.designId,
      component: this.component.raw,
      images: this.images,
    }
  }
}
