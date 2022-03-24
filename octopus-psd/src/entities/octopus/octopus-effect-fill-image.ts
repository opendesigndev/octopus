import type { Octopus } from '../../typings/octopus'

type OctopusFillImageOptions = {
  imagePath: string
  layout: Octopus['FillPositioning']['layout']
  transform: Octopus['Transform']
  origin: Octopus['FillPositioning']['origin']
  opacity?: number
  blendMode?: Octopus['BlendMode']
}

type ImageFilterOpacityMultiplier = { type: 'OPACITY_MULTIPLIER'; opacity: number }

export class OctopusEffectFillImage {
  private _imagePath: string
  private _layout: Octopus['FillPositioning']['layout']
  private _transform: Octopus['Transform']
  private _origin: Octopus['FillPositioning']['origin']
  private _opacity: number | undefined
  private _blendMode: Octopus['BlendMode'] | undefined

  constructor(options: OctopusFillImageOptions) {
    this._imagePath = options.imagePath
    this._layout = options.layout
    this._transform = options.transform
    this._origin = options.origin
    this._opacity = options.opacity
    this._blendMode = options.blendMode
  }

  private get _image(): Octopus['Image'] {
    const ref: Octopus['ImageRef'] = {
      type: 'RESOURCE',
      value: this._imagePath,
    }
    return { ref }
  }

  private get _positioning(): Octopus['FillPositioning'] {
    return { layout: this._layout, origin: this._origin, transform: this._transform }
  }

  private get _filters(): ImageFilterOpacityMultiplier[] {
    const filters = [] as ImageFilterOpacityMultiplier[]
    if (this._opacity !== undefined) {
      filters.push({ type: 'OPACITY_MULTIPLIER', opacity: this._opacity })
    }
    return filters
  }

  convert(): Octopus['FillImage'] {
    const image = this._image
    const positioning = this._positioning
    const filters = this._filters
    const blendMode = this._blendMode
    return { type: 'IMAGE', image, positioning, filters, blendMode }
  }
}
