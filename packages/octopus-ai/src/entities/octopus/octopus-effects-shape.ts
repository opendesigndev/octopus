import { getConverted } from '@opendesign/octopus-common/dist/utils/common.js'

import { OctopusEffectColorFill, ColorSpace } from './octopus-effect-color-fill.js'
import { OctopusEffectGradientFill } from './octopus-effect-fill-gradient.js'
import { OctopusEffectImageFill } from './octopus-effect-fill-image.js'
import { OctopusEffectStroke } from './octopus-effect-stroke.js'

import type { Octopus } from '../../typings/octopus/index.js'
import type { OctopusEffectParent } from '../../typings/octopus-entities.js'
import type { SourceLayerShape } from '../source/source-layer-shape.js'
import type { SourceLayerXObjectImage } from '../source/source-layer-x-object-image.js'
import type { SourceResources } from '../source/source-resources.js'

type OctopusEffectsShapeOptions = {
  sourceLayer: SourceLayerShape | SourceLayerXObjectImage
  resources: SourceResources
  parent: OctopusEffectParent
}

export type ShapeEffects = {
  fills?: Octopus['Fill'][]
  strokes?: Octopus['VectorStroke'][]
}

export class OctopusEffectsShape {
  private _sourceLayer: SourceLayerShape | SourceLayerXObjectImage
  private _resources: SourceResources
  private _parent: OctopusEffectParent

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
  ): (OctopusEffectColorFill | OctopusEffectGradientFill)[] {
    const fills = []
    if (sourceLayer.hasFill) {
      const colorSpaceValue = this._resources.getColorSpaceValue(sourceLayer.colorSpaceNonStroking ?? '') ?? ''

      fills.push(
        new OctopusEffectColorFill({
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
      sourceLayer.type === 'Image'
        ? this._parseSourceLayerXObjectImageFills(sourceLayer as SourceLayerXObjectImage)
        : getConverted(this._parseSourceLayerShapeFills(sourceLayer as SourceLayerShape))

    const strokes: Octopus['VectorStroke'][] =
      sourceLayer.type === 'Path' ? getConverted(this._parseStrokes(sourceLayer as SourceLayerShape)) : []

    return {
      ...(fills.length ? { fills } : null),
      ...(strokes.length ? { strokes } : null),
    }
  }
}
