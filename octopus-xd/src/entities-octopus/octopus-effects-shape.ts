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
  fallbackSource?: RawStyle,
  layerWidth?: number,
  layerHeight?: number
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
  private _layerWidth: number | undefined
  private _layerHeight: number | undefined

  constructor(options: OctopusEffectsShapeOptions) {
    this._sourceLayer = options.sourceLayer ?? null
    this._resources = options.resources
    this._fallbackSource = options.fallbackSource ?? null
    this._layerWidth = options.layerWidth
    this._layerHeight = options.layerHeight
  }

  private get style() {
    return this._sourceLayer?.style || this._fallbackSource
  }

  private _parseFills(): OctopusFill[] {
    const fill = this.style?.fill
    
    if (!fill) return []

    // Solid fill
    if ('color' in fill) {
      const solidFill = OctopusEffectColorFill.fromRaw({ effect: fill })
      return [ solidFill ]
    }

    // Gradient fill
    if ('gradient' in fill) {
      const gradientFill = OctopusEffectGradientFill.fromRaw({
        effect: fill,
        resources: this._resources,
        layerWidth: this._layerWidth,
        layerHeight: this._layerHeight
      })
      return [ gradientFill ]
    }

    // Image fill
    if ('pattern' in fill) {
      const patternFill = OctopusEffectImageFill.fromRaw({
        effect: fill,
        layerWidth: this._layerWidth,
        layerHeight: this._layerHeight
      })
      return [ patternFill ]
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