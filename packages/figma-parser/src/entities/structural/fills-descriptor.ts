import type { FigmaFillsDescriptor } from '../../types/figma'

type FillsDescriptorOptions = {
  fillsDescriptor: FigmaFillsDescriptor
}

export class FillsDescriptor {
  private _fillsDescriptor: FigmaFillsDescriptor

  constructor(options: FillsDescriptorOptions) {
    this._fillsDescriptor = options.fillsDescriptor
  }

  get raw(): FigmaFillsDescriptor {
    return this._fillsDescriptor
  }

  getImagesUrlsByIds(ids: string[]): string[] {
    const images = Object(this._fillsDescriptor?.meta?.images) as FigmaFillsDescriptor['meta']['images']
    return ids.map((id) => images[id])
  }
}
