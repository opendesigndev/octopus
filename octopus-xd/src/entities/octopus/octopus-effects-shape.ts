import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import OctopusBounds from './octopus-bounds'
import OctopusEffectFillColor from './octopus-effect-fill-color'
import OctopusEffectFillGradient from './octopus-effect-fill-gradient'
import OctopusEffectFillImage from './octopus-effect-fill-image'
import OctopusEffectStroke from './octopus-effect-stroke'

import type { Octopus } from '../../typings/octopus'
import type { OctopusFill } from '../../typings/octopus-entities'
import type SourceResources from '../source/source-resources'
import type OctopusLayerShape from './octopus-layer-shape'

type OctopusEffectsShapeOptions = {
  octopusLayer: OctopusLayerShape
  resources: SourceResources
}

type ShapeEffects = {
  fills?: Octopus['Fill'][]
  strokes?: Octopus['VectorStroke'][]
}

/**
 * Vector effects.
 */
export default class OctopusEffectsShape {
  private _octopusLayer: OctopusLayerShape
  private _resources: SourceResources
  private _fills: OctopusFill[]
  private _strokes: OctopusEffectStroke[]

  constructor(options: OctopusEffectsShapeOptions) {
    this._octopusLayer = options.octopusLayer
    this._resources = options.resources
    this._fills = this._parseFills()
    this._strokes = this._parseStrokes()
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
      const bounds = this._octopusLayer?.shapeData.shape.bounds
      if (!bounds) return []

      const gradientFill = OctopusEffectFillGradient.fromRaw({
        effect: fill,
        resources: this._resources,
        effectBounds: OctopusBounds.fromPaperBounds(bounds),
        compoundOffset: this._octopusLayer?.shapeData.compilationOffset,
      })

      return [gradientFill]
    }

    // Image fill
    if ('pattern' in fill) {
      const bounds = this._octopusLayer?.shapeData.shape.bounds
      if (!bounds) return []

      const patternFill = OctopusEffectFillImage.fromRaw({
        effect: fill,
        octopusLayer: this._octopusLayer,
        effectBounds: OctopusBounds.fromPaperBounds(bounds),
      })

      return [patternFill]
    }

    return []
  }

  private _parseStrokes(): OctopusEffectStroke[] {
    const stroke = this.style?.stroke
    return stroke ? [OctopusEffectStroke.fromRaw({ effect: stroke })] : []
  }

  convert(): ShapeEffects {
    const fills: Octopus['Fill'][] = getConverted(this._fills)
    const strokes: Octopus['VectorStroke'][] = getConverted(this._strokes)
    return {
      ...(fills.length ? { fills } : null),
      ...(strokes.length ? { strokes } : null),
    }
  }
}
