import type { Octopus } from '../../typings/octopus'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

type OctopusFillImageOptions = {
  imagePath: string
  layout: Octopus['FillPositioning']['layout']
  transform: Octopus['Transform']
  origin: Octopus['FillPositioning']['origin']
  parent: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter
}

export class OctopusEffectFillImage {
  private _imagePath: string
  private _layout: Octopus['FillPositioning']['layout']
  private _transform: Octopus['Transform']
  private _origin: Octopus['FillPositioning']['origin']
  private _parent: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter

  constructor(options: OctopusFillImageOptions) {
    this._imagePath = options.imagePath
    this._layout = options.layout
    this._transform = options.transform
    this._origin = options.origin
    this._parent = options.parent
  }

  get sourceLayer(): SourceLayerShape | SourceLayerLayer {
    return this._parent.sourceLayer
  }

  private _getImage(): Octopus['Image'] {
    const ref: Octopus['ImageRef'] = {
      type: 'RESOURCE',
      value: this._imagePath,
    }
    return { ref }
  }

  private _getPositioning(): Octopus['FillPositioning'] {
    return { layout: this._layout, origin: this._origin, transform: this._transform }
  }

  convert(): Octopus['FillImage'] {
    const image = this._getImage()
    const positioning = this._getPositioning()
    return { type: 'IMAGE', image, positioning }
  }
}
