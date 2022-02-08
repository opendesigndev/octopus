import type { Octopus } from '../../typings/octopus'
import { getMapped } from '@avocode/octopus-common/dist/utils/common'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'
import { OctopusEffectFillColor } from './octopus-effect-fill-color'
import { OctopusEffectFillGradient } from './octopus-effect-fill-gradient'
import { OctopusEffectFillImage } from './octopus-effect-fill-image'

type OctopusFillOptions = {
  parent: OctopusLayerShapeShapeAdapter
}

export class OctopusEffectFill {
  protected _parent: OctopusLayerShapeShapeAdapter

  static FILL_TYPE_MAP = {
    solidColorLayer: 'COLOR',
    gradientLayer: 'GRADIENT',
    patternLayer: 'IMAGE',
  } as const

  constructor(options: OctopusFillOptions) {
    this._parent = options.parent
  }

  get sourceLayer(): SourceLayerShape {
    return this._parent.sourceLayer
  }

  get fillType(): Octopus['FillType'] {
    const type = this.sourceLayer.fill.class
    const result = getMapped(type, OctopusEffectFill.FILL_TYPE_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Fill type', { type })
      return 'COLOR'
    }
    return result
  }

  convert(): Octopus['Fill'] {
    const sourceLayer = this.sourceLayer
    const parent = this._parent
    if (this.fillType === 'GRADIENT') return new OctopusEffectFillGradient({ parent }).convert()
    if (this.fillType === 'IMAGE') return new OctopusEffectFillImage({ parent }).convert()
    return new OctopusEffectFillColor({ sourceLayer }).convert()
  }
}
