import { asNumber } from '@opendesign/octopus-common/dist/utils/as.js'
import { getConverted } from '@opendesign/octopus-common/dist/utils/common.js'

import { OctopusLayerCommon } from './octopus-layer-common.js'
import { createOctopusLayerShapeFromShapeAdapter } from '../../factories/create-octopus-layer.js'
import { createOctopusLayersFromLayerSequences } from '../../utils/layer.js'

import type { SourceLayerWithMask } from './octopus-layer-soft-mask-group.js'
import type { OctopusLayer } from '../../factories/create-octopus-layer.js'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service/index.js'
import type { Octopus } from '../../typings/octopus/index.js'
import type { OctopusLayerParent } from '../../typings/octopus-entities.js'
import type { Nullish } from '@opendesign/octopus-common/dist/utility-types.js'

export type OctopusLayerMaskOptions = {
  parent: OctopusLayerParent
  layerSequences: LayerSequence[]
}

export class OctopusLayerMaskGroup extends OctopusLayerCommon {
  private _layers: OctopusLayer[] = []
  protected _id: string

  constructor({ parent, layerSequences }: OctopusLayerMaskOptions) {
    super({
      parent,
      layerSequence: { sourceLayers: [(layerSequences[0].sourceLayers[0] as SourceLayerWithMask).mask] },
    })

    this._id = this._sourceLayer.parentArtboard.uniqueId()

    this._layers = createOctopusLayersFromLayerSequences({
      layerSequences: layerSequences,
      parent: this,
    })
  }

  private _doesPathConsistsOnlyFromRectSubpaths(path: Octopus['ShapeLayer']['shape']['path'] & { type: 'COMPOUND' }) {
    return !path.paths.some((subpath) => {
      return subpath.type !== 'RECTANGLE'
    })
  }

  private _normalizeRectSubpaths(rectSubpaths: Octopus['PathRectangle'][]): Required<Octopus['Rectangle']>[] {
    return rectSubpaths.map((subpath: Octopus['PathRectangle']) => {
      const {
        rectangle: { x0, x1, y0, y1 },
      } = subpath

      return {
        x0: Math.min(asNumber(x0), asNumber(x1)),
        x1: Math.max(asNumber(x0), asNumber(x1)),
        y0: Math.min(asNumber(y0), asNumber(y1)),
        y1: Math.max(asNumber(y0), asNumber(y1)),
      }
    })
  }

  private _createIntersectionFromRectangles(
    rectSubpaths: Required<Octopus['PathRectangle']['rectangle']>[]
  ): Required<Octopus['PathRectangle']['rectangle']> {
    return rectSubpaths.reduce((rectFinal, currentRect) => {
      return {
        ...rectFinal,
        x0: Math.max(rectFinal.x0, currentRect.x0),
        x1: Math.min(rectFinal.x1, currentRect.x1),
        y0: Math.max(rectFinal.y0, currentRect.y0),
        y1: Math.min(rectFinal.y0, currentRect.y0),
      }
    })
  }

  /** Taken comment from illustrator2 :  Sometimes, the clipping paths have no intersections (it can happen when the clipping mask is
     out of artbaord). We can skip the original layer in that case. */
  private _isMaskValid(mask: Octopus['ShapeLayer']): boolean {
    const { path } = mask.shape

    if (!path || path.type !== 'COMPOUND') {
      return true
    }

    if (!this._doesPathConsistsOnlyFromRectSubpaths(path)) {
      return true
    }

    const normalizedRectangles = this._normalizeRectSubpaths(path.paths as Octopus['PathRectangle'][])
    const { x0, x1, y1, y0 } = this._createIntersectionFromRectangles(normalizedRectangles)

    return x1 - x0 > 0 && y1 - y0 > 0
  }

  private _createMask(): Nullish<Octopus['ShapeLayer']> {
    const sourceMask = this._sourceLayer

    if (!sourceMask) {
      return null
    }

    const mask = createOctopusLayerShapeFromShapeAdapter({
      layerSequence: { sourceLayers: [sourceMask] },
      parent: this,
    }).convert()

    if (!mask || !this._isMaskValid(mask)) {
      return null
    }

    return mask
  }

  private _convertTypeSpecific() {
    const mask = this._createMask()

    if (!mask) {
      return null
    }

    return {
      type: 'MASK_GROUP' as const,
      maskBasis: 'BODY',
      layers: getConverted(this._layers),
      mask,
    } as const
  }

  get blendMode(): Octopus['LayerBase']['blendMode'] {
    return 'PASS_THROUGH'
  }

  convert(): Octopus['MaskGroupLayer'] | null {
    const common = this.convertCommon()
    const specific = this._convertTypeSpecific()

    if (!specific || specific.layers.length === 0) {
      return null
    }

    return {
      ...common,
      ...specific,
    }
  }
}
