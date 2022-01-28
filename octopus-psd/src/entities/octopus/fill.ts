import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/color'
import { getMapped } from '../../utils/common'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

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

  private get _fillColor(): Octopus['FillColor'] {
    const color = convertColor(this._sourceLayer.fill.color)
    return { type: 'COLOR', color }
  }

  private get _fillGradient(): Octopus['FillGradient'] {
    return { type: 'GRADIENT' } as Octopus['FillGradient'] // TODO
  }

  private get _fillImage(): Octopus['FillImage'] {
    return { type: 'IMAGE' } as Octopus['FillImage'] // TODO
  }

  convert(): Octopus['Fill'] {
    switch (this.fillType) {
      case 'GRADIENT': {
        return this._fillGradient
      }
      case 'IMAGE': {
        return this._fillImage
      }
    }
    return this._fillColor
  }
}
