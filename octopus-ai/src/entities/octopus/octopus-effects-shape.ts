import { getConverted } from '@avocode/octopus-common/dist/utils/common'

import OctopusEffectStroke from './octopus-effect-stroke'
import OctopusEffectFill, { ColorSpace } from './octopus-effect-color-fill'
import OctopusEffectGradientFill from './octopus-effect-fill-gradient'
import OctopusEffectImageFill from './octopus-effect-fill-image'

import type SourceLayerShape from '../source/source-layer-shape'
import type { Octopus } from '../../typings/octopus'
import type SourceResources from '../source/source-resources'
import type SourceLayerXObjectImage from '../source/source-layer-x-object-image'
import type { OctopusLayerParent } from '../../typings/octopus-entities'

type OctopusEffectsShapeOptions = {
  sourceLayer: SourceLayerShape | SourceLayerXObjectImage
  resources: SourceResources
  parent: OctopusLayerParent
}

export type ShapeEffects = {
  fills?: Octopus['Fill'][]
  strokes?: Octopus['VectorStroke'][]
}

export default class OctopusEffectsShape {
  private _sourceLayer: SourceLayerShape | SourceLayerXObjectImage
  private _resources: SourceResources
  private _parent: OctopusLayerParent

  constructor(options: OctopusEffectsShapeOptions) {
    this._sourceLayer = options.sourceLayer
    this._resources = options.resources
    this._parent = options.parent
  }

  private _parseStrokes(sourceLayer: SourceLayerShape): OctopusEffectStroke[] {
    return sourceLayer.stroke
      ? [
          new OctopusEffectStroke({
            resources: this._resources,
            sourceLayer,
          }),
        ]
      : []
  }

  private _parseSourceLayerShapeFills(
    sourceLayer: SourceLayerShape
  ): (OctopusEffectFill | OctopusEffectGradientFill)[] {
    const fills = []

    if (sourceLayer.isFill) {
      const colorSpaceValue = this._resources.getColorSpaceValue(sourceLayer.colorSpaceNonStroking ?? '') ?? ''

      fills.push(
        new OctopusEffectFill({
          colorSpaceValue,
          sourceLayer,
          colorSpaceType: ColorSpace.NON_STROKING,
        })
      )
    }

    if (this._sourceLayer.type === 'Shading') {
      fills.push(
        new OctopusEffectGradientFill({
          resources: this._resources,
          sourceLayer,
        })
      )
    }

    return fills
  }

  private _parseSourceLayerXObjectImageFills(sourceLayer: SourceLayerXObjectImage): Octopus['FillImage'][] {
    const fill = new OctopusEffectImageFill({ sourceLayer, parent: this._parent })
    return getConverted([fill]).filter((converted) => converted) as Octopus['FillImage'][]
  }

  convert(): ShapeEffects {
    const sourceLayer = this._sourceLayer
    const fills: Octopus['Fill'][] =
      sourceLayer.type === 'Path'
        ? getConverted(this._parseSourceLayerShapeFills(sourceLayer as SourceLayerShape))
        : this._parseSourceLayerXObjectImageFills(sourceLayer as SourceLayerXObjectImage)
    const strokes: Octopus['VectorStroke'][] =
      sourceLayer.type === 'Path' ? getConverted(this._parseStrokes(sourceLayer as SourceLayerShape)) : []

    return {
      ...(fills.length ? { fills } : null),
      ...(strokes.length ? { strokes } : null),
    }
  }
}
