import OctopusLayerCommon, { LayerSpecifics } from './octopus-layer-common'
import { OctopusLayerParent } from '../typings/octopus-entities'
import type { Octopus } from '../typings/octopus'
import SourceLayerShape from '../entities-source/source-layer-shape'
import SourceLayerShapeSubPath from '../entities-source/source-layer-shape-subpath'

import OctopusLayerShape from './octopus-layer-shape'

type OctopusLayerMaskOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export default class OctopusLayerMaskGroup extends OctopusLayerCommon {
  public _sourceLayer: SourceLayerShape

  static isShapeMaskGroup(layer: SourceLayerShape): boolean {
    if (layer.clippingPath && layer.clippingPath.length) {
      return true
    }

    return false
  }

  constructor(options: OctopusLayerMaskOptions) {
    super(options)
    this._sourceLayer = options.sourceLayer
  }

  private _createLayer(sourceLayer: SourceLayerShape) {
    return new OctopusLayerShape({ parent: this, sourceLayer })
  }

  private _createMask() {
    if (!this._sourceLayer?.sourceMask) {
      return []
    }

    return this._sourceLayer.sourceMask.map((sourceLayer) => this._createLayer(sourceLayer))
  }

  private _convertTypeSpecific() {
    return {
      type: 'MASK_GROUP' as const,
      maskBasis: 'BODY',
      layers: [this._createLayer(this._sourceLayer)],
      mask: this._createMask(),
    }
  }

  convert() {
    const common = this.convertCommon()
    const specific = this._convertTypeSpecific()

    return {
      ...common,
      ...specific,
    }
  }
}
