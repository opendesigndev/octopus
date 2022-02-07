import OctopusEffectFillColor from './octopus-effect-fill-color'
import OctopusEffectStroke from './octopus-effect-stroke'
import { getConverted } from '../../utils/common'

import type { Octopus } from '../../typings/octopus'
import type { RawStyle } from '../../typings/source'
import type { OctopusFill } from '../../typings/octopus-entities'
import OctopusLayerText from './octopus-layer-text'


type OctopusEffectsTextOptions = {
  effectSource?: RawStyle
}

type FromTextLayerOptions = {
  octopusLayer: OctopusLayerText
}

type TextEffects = {
  fills?: Octopus['Fill'][],
  strokes?: Octopus['VectorStroke'][]
}

/**
 * Vector effects.
 */
export default class OctopusEffectsText {
  private _effectSource: RawStyle | null

  static fromTextLayer(options: FromTextLayerOptions) {
    return new this({
      effectSource: options.octopusLayer.sourceLayer.style as RawStyle
    })
  }

  constructor(options: OctopusEffectsTextOptions) {
    this._effectSource = options.effectSource ?? null
  }

  private get style() {
    return this._effectSource
  }

  private _parseFills(): OctopusFill[] {
    const fill = this.style?.fill

    if (!fill) return []

    // Solid fill
    if ('color' in fill) {
      const solidFill = OctopusEffectFillColor.fromRaw({ effect: fill })
      return [solidFill]
    }

    return []
  }

  private _parseStrokes(): OctopusEffectStroke[] {
    const stroke = this.style?.stroke
    return stroke
      ? [OctopusEffectStroke.fromRaw({ effect: stroke })]
      : []
  }

  convert(): TextEffects {
    const fills: Octopus['Fill'][] = getConverted(this._parseFills())
    const strokes: Octopus['VectorStroke'][] = getConverted(this._parseStrokes())
    return {
      ...(fills.length ? { fills } : null),
      ...(strokes.length ? { strokes } : null),
    }
  }
}