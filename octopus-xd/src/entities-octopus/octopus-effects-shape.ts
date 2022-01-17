import OctopusEffectColorFill from './octopus-effect-color-fill'
import OctopusEffectGradientFill from './octopus-effect-gradient-fill'
import OctopusEffectImageFill from './octopus-effect-image-fill'
import OctopusEffectStroke from './octopus-effect-stroke'
import { getConverted } from '../utils/common'

import type { SourceLayer } from '../factories/create-source-layer'
import type { Octopus } from '../typings/octopus'
import type { RawStyle } from '../typings/source'
import type SourceResources from '../entities-source/source-resources'
import type { OctopusFill } from '../typings/octopus-entities'


type OctopusEffectsShapeOptions = {
  sourceLayer?: SourceLayer,
  resources: SourceResources,
  fallbackSource?: RawStyle
}

type ShapeEffects = {
  fills?: Octopus['Fill'][],
  strokes?: Octopus['VectorStroke'][]
}

/**
 * Vector effects.
 */
export default class OctopusEffectsShape {
  private _sourceLayer: SourceLayer | null
  private _fallbackSource: RawStyle | null
  private _resources: SourceResources

  constructor(options: OctopusEffectsShapeOptions) {
    this._sourceLayer = options.sourceLayer ?? null
    this._resources = options.resources
    this._fallbackSource = options.fallbackSource ?? null
  }

  private get style() {
    return this._sourceLayer?.style || this._fallbackSource
  }

  private _parseFills(): OctopusFill[] {
    const fill = this.style?.fill
    
    if (!fill) return []

    // Solid fill
    if ('color' in fill) {
      return [ OctopusEffectColorFill.fromRaw({ effect: fill }) ]
    }

    // Gradient fill
    if ('gradient' in fill) {
      return [ OctopusEffectGradientFill.fromRaw({ effect: fill, resources: this._resources }) ]
    }

    // Image fill
    if ('pattern' in fill) {
      return [ OctopusEffectImageFill.fromRaw({ effect: fill }) ]
    }
    
    return []
  }

  private _parseStrokes(): OctopusEffectStroke[] {
    const stroke = this.style?.stroke
    return stroke
      ? [ OctopusEffectStroke.fromRaw({ effect: stroke }) ]
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