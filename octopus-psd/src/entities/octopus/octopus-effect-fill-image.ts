import type { Octopus } from '../../typings/octopus'
import { convertImagePath } from '../../utils/resource'
import type { SourceLayerLayer } from '../source/source-layer-layer'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeLayerAdapter } from './octopus-layer-shape-layer-adapter'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

type OctopusFillImageOptions = {
  parent: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter
}

export class OctopusEffectFillImage {
  protected _parent: OctopusLayerShapeShapeAdapter | OctopusLayerShapeLayerAdapter

  constructor(options: OctopusFillImageOptions) {
    this._parent = options.parent
  }

  get sourceLayer(): SourceLayerShape | SourceLayerLayer {
    return this._parent.sourceLayer
  }

  private _mapImage(layer: SourceLayerShape | SourceLayerLayer): Octopus['Image'] {
    const ref: Octopus['ImageRef'] = {
      type: 'RESOURCE',
      value: convertImagePath(layer?.imageName ?? ''), // TODO this is not correct for SourceLayerShape
    }
    return { ref }
  }

  private _mapPositioning(layer: SourceLayerShape | SourceLayerLayer): Octopus['FillPositioning'] {
    const transform: Octopus['Transform'] = [layer?.width, 0, 0, layer?.height, 0, 0] // TODO
    return { layout: 'FILL', origin: 'LAYER', transform }
  }

  convert(): Octopus['FillImage'] {
    const image = this._mapImage(this.sourceLayer)
    const positioning = this._mapPositioning(this.sourceLayer)
    return { type: 'IMAGE', image, positioning }
  }
}
