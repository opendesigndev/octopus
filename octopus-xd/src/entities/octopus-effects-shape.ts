import { SourceLayer } from '../factories/create-source-layer'
import { Octopus } from '../typings/octopus'
import { RawStyle } from '../typings/source'
import OctopusEffectColorFill from './octopus-effect-color-fill'
import OctopusEffectGradientFill from './octopus-effect-gradient-fill'
import OctopusEffectImageFill from './octopus-effect-image-fill'
import OctopusEffectStroke from './octopus-effect-stroke'
import SourceResources from './source-resources'


type OctopusEffectsShapeOptions = {
  sourceLayer?: SourceLayer,
  resources: SourceResources,
  fallbackSource?: RawStyle
}

type ShapeEffects = {
  fills?: Octopus['FillEffect'][],
  strokes?: Octopus['EffectStroke'][]
}

type OctopusFill = OctopusEffectColorFill | OctopusEffectGradientFill | OctopusEffectImageFill

/**
 * Vector effects.
 */
export default class OctopusEffectsShape {
  _sourceLayer: SourceLayer | null
  _fallbackSource: RawStyle | null
  _resources: SourceResources

  constructor(options: OctopusEffectsShapeOptions) {
    this._sourceLayer = options.sourceLayer ?? null
    this._resources = options.resources
    this._fallbackSource = options.fallbackSource ?? null
  }

  get style() {
    return this._sourceLayer?.style || this._fallbackSource
  }

  _parseFills(): OctopusFill[] {
    const fill = this.style?.fill
    
    if (!fill) return []

    // Solid fill
    if ('color' in fill) {
      return [ new OctopusEffectColorFill({ effect: fill }) ]
    }

    // Gradient fill
    if ('gradient' in fill) {
      return [ new OctopusEffectGradientFill({ effect: fill, resources: this._resources }) ]
    }

    // Image fill
    if ('pattern' in fill) {
      return [ new OctopusEffectImageFill({ effect: fill }) ]
    }
    
    return []
  }

  _convertFills(): Octopus['FillEffect'][] {
    return this._parseFills().reduce((fills, octopusFill) => {
      const fill = octopusFill.convert()
      return fill ? [ ...fills, fill ] : fills
    }, [])
  }

  _parseStrokes(): OctopusEffectStroke[] {
    const stroke = this.style?.stroke
    return stroke
      ? [ new OctopusEffectStroke({ effect: stroke }) ]
      : []
  }

  _convertStrokes(): Octopus['EffectStroke'][] {
    return this._parseStrokes().reduce((strokes, octopusStroke) => {
      const stroke = octopusStroke.convert()
      return stroke ? [ ...strokes, stroke ] : strokes
    }, [])
  }

  convert(): ShapeEffects {
    const fills: Octopus['FillEffect'][] = this._convertFills()
    const strokes: Octopus['EffectStroke'][] = this._convertStrokes()

    /** 
     * @TODO maybe it's better to expose effects as `effects` array 
     * same way as on layer instead of fills/strokes props 
     * */
    return {
      ...(fills.length ? { fills } : null),
      ...(strokes.length ? { strokes } : null),
    }
  }
}