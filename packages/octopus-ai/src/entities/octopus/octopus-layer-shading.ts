import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { parseRect } from '../../utils/rectangle.js'
import { OctopusEffectsShape } from './octopus-effects-shape.js'
import { OctopusLayerCommon } from './octopus-layer-common.js'
import { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter.js'

import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service/index.js'
import type { Octopus, OctopusLayerShapeAdapter } from '../../typings/octopus/index.js'
import type { OctopusLayerParent } from '../../typings/octopus-entities.js'
import type { RawGraphicsStateMatrix } from '../../typings/raw/index.js'
import type { SourceLayerShape } from '../source/source-layer-shape.js'
import type { LayerSpecifics } from './octopus-layer-common.js'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerShading extends OctopusLayerCommon implements OctopusLayerShapeAdapter {
  declare _sourceLayer: SourceLayerShape

  static DEFAULT_RECT_COORDS = [0, 0, 0, 0]
  static DEFAULT_GEOMETRY = ''
  static FILL_RULE = {
    'nonzero-winding-number': 'NON_ZERO',
    'even-odd': 'EVEN_ODD',
  } as const
  static DEFAULT_FILL_RULE = 'EVEN_ODD' as const

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
  }

  private _createClippingPaths(): Octopus['PathLike'][] {
    return asArray(
      this._sourceLayer.clippingPaths
        ?.map((sourceLayer) => {
          return {
            ...new OctopusLayerShapeShapeAdapter({
              parent: this._parent,
              layerSequence: { sourceLayers: [sourceLayer] },
            }).getPath(),
            transform: sourceLayer.transformMatrix,
          }
        })
        .filter((path): path is Octopus['PathLike'] & { transform: RawGraphicsStateMatrix } => Boolean(path))
    )
  }

  private _parseClippingCompound(paths: Octopus['PathLike'][]): Octopus['CompoundPath'] {
    return {
      type: 'COMPOUND',
      op: 'INTERSECT',
      paths,
    }
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
      parent: this,
    })
  }

  private _parseSourceShading(): Octopus['PathLike'] | null {
    const paths = this._createClippingPaths().filter((path) => path)

    if (paths.length) {
      return this._parseClippingCompound(paths)
    }

    const coords = this._sourceLayer.parentArtboardMediaBox

    return parseRect(coords)
  }

  private _getShapes(): Octopus['Shape'] | null {
    const path = this._parseSourceShading()
    const shapeEffects = this._createShapeEffects().convert()

    if (!path) {
      return null
    }

    const fillShape: Octopus['Shape'] = {
      fillRule: this.fillRule,
      path,
      ...shapeEffects,
    } as const

    return fillShape
  }

  get fillRule(): 'NON_ZERO' | 'EVEN_ODD' {
    const sourceFillRule = this._sourceLayer.fillRule
    return sourceFillRule ? OctopusLayerShading.FILL_RULE[sourceFillRule] : OctopusLayerShading.DEFAULT_FILL_RULE
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> | null {
    const shape = this._getShapes()
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
    } as const
  }
}
