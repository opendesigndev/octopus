import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import OctopusEffectStroke from './octopus-effect-stroke'
import OctopusEffectFill, { ColorSpace } from './octopus-effect-color-fill'
import OctopusEffectGradientFill from './octopus-effect-fill-gradient'

import type SourceLayerShape from '../source/source-layer-shape'
import type { Octopus } from '../../typings/octopus'
import type SourceResources from '../source/source-resources'

type OctopusEffectsShapeOptions = {
  sourceLayer: SourceLayerShape
  resources: SourceResources
}

export type ShapeEffects = {
  fills?: Octopus['Fill'][]
  strokes?: Octopus['VectorStroke'][]
}

export default class OctopusEffectsShape {
  private _sourceLayer: SourceLayerShape
  private _resources: SourceResources

  constructor(options: OctopusEffectsShapeOptions) {
    this._sourceLayer = options.sourceLayer
    this._resources = options.resources
  }

  private _parseStrokes(): OctopusEffectStroke[] {
    return this._sourceLayer.stroke
      ? [
          new OctopusEffectStroke({
            resources: this._resources,
            sourceLayer: this._sourceLayer,
          }),
        ]
      : []
  }

  private _parseFills(): (OctopusEffectFill | OctopusEffectGradientFill)[] {
    const fills = []

    if (this._sourceLayer.isFill) {
      const colorSpaceValue = this._resources.getColorSpaceValue(this._sourceLayer.colorSpaceNonStroking ?? '') ?? ''

      fills.push(
        new OctopusEffectFill({
          colorSpaceValue,
          sourceLayer: this._sourceLayer,
          colorSpaceType: ColorSpace.NON_STROKING,
        })
      )
    }

    if (this._sourceLayer.type === 'Shading') {
      fills.push(
        new OctopusEffectGradientFill({
          resources: this._resources,
          sourceLayer: this._sourceLayer,
        })
      )
    }
    return fills
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
