import OctopusEffectFillColor from './octopus-effect-fill-color'
import OctopusEffectFillGradient from './octopus-effect-fill-gradient'
import OctopusEffectFillImage from './octopus-effect-fill-image'
import OctopusEffectStroke from './octopus-effect-stroke'
import { getConverted } from '../../utils/common'
import OctopusBounds from './octopus-bounds'

import type { Octopus } from '../../typings/octopus'
import type SourceResources from '../source/source-resources'
import type { OctopusFill } from '../../typings/octopus-entities'
import type OctopusLayerShape from './octopus-layer-shape'


type OctopusEffectsShapeOptions = {
  octopusLayer?: OctopusLayerShape,
  resources: SourceResources
}

type ShapeEffects = {
  fills?: Octopus['Fill'][],
  strokes?: Octopus['VectorStroke'][]
}

/**
 * Vector effects.
 */
export default class OctopusEffectsShape {
  private _octopusLayer: OctopusLayerShape | null
  private _resources: SourceResources

  constructor(options: OctopusEffectsShapeOptions) {
    this._octopusLayer = options.octopusLayer ?? null
    this._resources = options.resources
  }

  private get style() {
    return this._octopusLayer?.sourceLayer.style
  }

  private _parseFills(): OctopusFill[] {
    const fill = this.style?.fill

    if (!fill) return []

    // Solid fill
    if ('color' in fill) {
      const solidFill = OctopusEffectFillColor.fromRaw({ effect: fill })
      return [solidFill]
    }

    // Gradient fill
    if ('gradient' in fill) {
      const bounds = this._octopusLayer?.shapeData.bounds
      if (!bounds) return []

      const gradientFill = OctopusEffectFillGradient.fromRaw({
        effect: fill,
        resources: this._resources,
        effectBounds: OctopusBounds.fromPaperBounds(bounds)
      })

      return [gradientFill]
    }

    // Image fill
    if ('pattern' in fill) {
      const bounds = this._octopusLayer?.shapeData.bounds
      if (!bounds) return []

      const patternFill = OctopusEffectFillImage.fromRaw({
        effect: fill,
        effectBounds: OctopusBounds.fromPaperBounds(bounds)
      })

      return [patternFill]
    }

    return []
  }

  private _parseStrokes(): OctopusEffectStroke[] {
    const stroke = this.style?.stroke
    return stroke
      ? [OctopusEffectStroke.fromRaw({ effect: stroke })]
      : []
  }

  convert(): ShapeEffects {
    const fills: Octopus['Fill'][] = getConverted(this._parseFills())
    const strokes: Octopus['VectorStroke'][] = getConverted(this._parseStrokes())
    return {
      ...(fills.length ? { fills } : null),
      ...(strokes.length ? { strokes } : null),
    }
  }
}