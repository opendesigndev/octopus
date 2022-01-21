import type { Octopus } from '../../typings/octopus'
import { convertColor } from '../../utils/color'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

type OctopusFillOptions = {
  parent: OctopusLayerShapeShapeAdapter
  sourceLayer: SourceLayerShape
}

export default class OctopusFill {
  protected _parent: OctopusLayerShapeShapeAdapter
  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusFillOptions) {
    this._parent = options.parent
    this._sourceLayer = options.sourceLayer
  }

  get fillType() {
    const type = this._sourceLayer.fill.class
    const map: { [key: string]: Octopus['FillType'] } = {
      solidColorLayer: 'COLOR',
      gradientLayer: 'GRADIENT',
      patternLayer: 'IMAGE',
    }
    const result = map[type as string]
    if (!result) {
      this._parent.converter?.logger?.warn('Unknown Fill type', { extra: { type } })
      this._parent.converter?.sentry?.captureMessage('Unknown Fill type', { extra: { type } })
      return 'COLOR'
    }
    return result
  }

  private get _fillBase(): Octopus['FillBase'] {
    return { type: this.fillType }
  }

  private get _fillColor(): Octopus['FillColor'] {
    const color = convertColor(this._sourceLayer.fill.color)
    return {
      ...this._fillBase,
      color,
    } as Octopus['FillColor']
  }

  private get _fillGradient(): Octopus['FillGradient'] {
    return { ...this._fillBase } as Octopus['FillGradient'] // TODO
  }

  private get _fillImage(): Octopus['FillImage'] {
    return { ...this._fillBase } as Octopus['FillImage'] // TODO
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
