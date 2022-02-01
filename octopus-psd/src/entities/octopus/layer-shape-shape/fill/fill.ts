import type { Octopus } from '../../../../typings/octopus'
import { getMapped } from '../../../../utils/common'
import type { SourceLayerShape } from '../../../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from '../layer-shape-shape-adapter'
import { convertFillColor } from './fill-color'
import { convertFillGradient } from './fill-gradient'
import { convertFillImage } from './fill-image'

type OctopusFillOptions = {
  parent: OctopusLayerShapeShapeAdapter
  sourceLayer: SourceLayerShape
}

export default class OctopusFill {
  protected _parent: OctopusLayerShapeShapeAdapter
  protected _sourceLayer: SourceLayerShape

  static FILL_TYPE_MAP = {
    solidColorLayer: 'COLOR',
    gradientLayer: 'GRADIENT',
    patternLayer: 'IMAGE',
  } as const

  constructor(options: OctopusFillOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer
  }

  get fillType(): Octopus['FillType'] {
    const type = this._sourceLayer.fill.class
    const result = getMapped(type, OctopusFill.FILL_TYPE_MAP, undefined)
    if (!result) {
      this._parent.converter?.logWarn('Unknown Fill type', { type })
      return 'COLOR'
    }
    return result
  }

  convert(): Octopus['Fill'] {
    if (this.fillType === 'GRADIENT') return convertFillGradient(this._sourceLayer)
    if (this.fillType === 'IMAGE') return convertFillImage(this._sourceLayer)
    return convertFillColor(this._sourceLayer.fill)
  }
}
