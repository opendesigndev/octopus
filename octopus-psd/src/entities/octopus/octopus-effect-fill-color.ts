import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/color'
import type { SourceLayerShape } from '../source/source-layer-shape'

type OctopusFillOptions = {
  sourceLayer: SourceLayerShape
}

export class OctopusEffectFillColor {
  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusFillOptions) {
    this._sourceLayer = options.sourceLayer
  }

  convert(): Octopus['FillColor'] {
    const color = convertColor(this._sourceLayer.fill?.color)
    return { type: 'COLOR', color }
  }
}
