import OctopusEffectStroke from './octopus-effect-stroke'
import {OctopusLayerParent} from '../typings/octopus-entities'
import SourceLayerShape from '../entities-source/source-layer-shape'
import OctopusEffectFill from './octopus-effect-color-fill'
import type { Octopus } from '../typings/octopus'
import { getConverted } from '@avocode/octopus-common/dist/utils/common'

type OctopusEffectsShapeOptions = {
    sourceLayer: SourceLayerShape,
    parent: OctopusLayerParent,
  }

type ShapeEffects = {
  fills?: Octopus['Fill'][],
  strokes?: Octopus['VectorStroke'][]
}

export default class OctopusEffectsShape {
  private _sourceLayer: SourceLayerShape
  private _parent: OctopusLayerParent

  constructor(options: OctopusEffectsShapeOptions) {
    this._sourceLayer = options.sourceLayer
    this._parent =  options.parent
  }

  private _parseStrokes(): OctopusEffectStroke[] {
    return this._parent.resources && this._sourceLayer
      ? [new OctopusEffectStroke({ 
        resources: this._parent.resources,
        sourceLayer: this._sourceLayer
       }) ]
      : []
  }

  private _parseFills(): OctopusEffectFill[] {
    return this._parent.resources && this._sourceLayer
      ? [new OctopusEffectFill({ 
        resources: this._parent.resources,
        sourceLayer: this._sourceLayer,
        colorSpaceType: 'ColorSpaceNonStroking'
       }) ]
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