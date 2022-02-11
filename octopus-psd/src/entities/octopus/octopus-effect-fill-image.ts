import type { Octopus } from '../../typings/octopus'
import path from 'path'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

type OctopusFillImageOptions = {
  parent: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter
}

export class OctopusEffectFillImage {
  protected _parent: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter

  static IMAGE_PREFIX = 'pictures'

  constructor(options: OctopusFillImageOptions) {
    this._parent = options.parent
  }

  get sourceLayer(): SourceLayerShape | SourceLayerLayer {
    return this._parent.sourceLayer
  }

  private _convertImagePath(name: string) {
    return path.join(OctopusEffectFillImage.IMAGE_PREFIX, name)
  }

  private _getImage(): Octopus['Image'] {
    const ref: Octopus['ImageRef'] = {
      type: 'RESOURCE',
      value: this._convertImagePath(this.sourceLayer?.imageName ?? ''), // TODO this is not correct for SourceLayerShape
    }
    return { ref }
  }

  private _getPositioning(): Octopus['FillPositioning'] {
    const { width, height } = this.sourceLayer.bounds
    const transform: Octopus['Transform'] = [width, 0, 0, height, 0, 0] // TODO patterns will need fix
    return { layout: 'FILL', origin: 'LAYER', transform }
  }

  convert(): Octopus['FillImage'] {
    const image = this._getImage()
    const positioning = this._getPositioning()
    return { type: 'IMAGE', image, positioning }
  }
}
