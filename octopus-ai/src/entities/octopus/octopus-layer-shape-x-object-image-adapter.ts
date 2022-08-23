import { parseRect } from '../../utils/rectangle'
import { OctopusEffectsShape } from './octopus-effects-shape'
import { OctopusLayerCommon } from './octopus-layer-common'

import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus, OctopusLayerShapeAdapter } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { SourceLayerXObjectImage } from '../source/source-layer-x-object-image'
import type { LayerSpecifics } from './octopus-layer-common'

type OctopusLayerShapeXObjectImageAdapterOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerShapeXObjectImageAdapter extends OctopusLayerCommon implements OctopusLayerShapeAdapter {
  protected _sourceLayer: SourceLayerXObjectImage

  constructor(options: OctopusLayerShapeXObjectImageAdapterOptions) {
    super(options)
  }

  private _createShapeEffects(): OctopusEffectsShape {
    const sourceLayer = this._sourceLayer
    const resources = this._parent.resources

    if (!resources) {
      throw new Error("Design resources are missing, can't resolve effects.")
    }

    return new OctopusEffectsShape({
      sourceLayer,
      resources,
      parent: this._parent,
    })
  }

  private _getShape(): Octopus['Shape'] | null {
    const shapeEffects = this._createShapeEffects().convert()

    const fillShape: Octopus['Shape'] = {
      ...shapeEffects,
      path: parseRect([0, 0, 1, 1]),
    } as const

    return fillShape
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> | null {
    const shape = this._getShape()
    if (!shape) {
      return null
    }

    return {
      type: 'SHAPE',
      shape,
    } as const
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertCommon()
    const specific = this._convertTypeSpecific()

    if (!specific) {
      return null
    }

    return {
      ...common,
      ...specific,
      transform: this._sourceLayer.transformMatrix,
    }
  }
}