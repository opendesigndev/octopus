import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import OctopusEffectStroke from './octopus-effect-stroke'
import OctopusEffectFill, { ColorSpace } from './octopus-effect-color-fill'

import type SourceLayerShape from '../entities-source/source-layer-shape'
import type { Octopus } from '../typings/octopus'
import type SourceResources from '../entities-source/source-resources'

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

  private _parseFills(): OctopusEffectFill[] {
    return this._sourceLayer.fill
      ? [
          new OctopusEffectFill({
            resources: this._resources,
            sourceLayer: this._sourceLayer,
            colorSpaceType: ColorSpace.COLOR_SPACE_NON_STROKING,
          }),
        ]
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
