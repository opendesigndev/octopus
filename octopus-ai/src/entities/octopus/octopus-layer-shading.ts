import { asArray } from '@avocode/octopus-common/dist/utils/as'

import { parseRectangleCoords } from '../../utils/coords'
import { OctopusEffectsShape } from './octopus-effects-shape'
import { OctopusLayerCommon } from './octopus-layer-common'
import { OctopusLayerShapeShapeAdapter } from './octopus-layer-shape-shape-adapter'

import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service'
import type { Octopus, OctopusLayerShapeAdapter } from '../../typings/octopus'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { RectCoords } from '../../utils/coords'
import type { SourceLayerShape } from '../source/source-layer-shape'
import type { SourceLayerShapeSubPath } from '../source/source-layer-shape-subpath'
import type { LayerSpecifics } from './octopus-layer-common'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerShading extends OctopusLayerCommon implements OctopusLayerShapeAdapter {
  static DEFAULT_RECT_COORDS = [0, 0, 0, 0]
  static DEFAULT_GEOMETRY = 'MZ'
  static FILL_RULE = {
    'nonzero-winding-number': 'NON_ZERO',
    'even-odd': 'EVEN_ODD',
  } as const
  static DEFAULT_FILL_RULE = 'EVEN_ODD' as const

  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
  }

  private _parseRectangleCoords(coords: number[]): RectCoords {
    return parseRectangleCoords(coords)
  }

  private _parseRect(coords: SourceLayerShapeSubPath['_coords']): Octopus['PathRectangle'] {
    const rectangle = this._parseRectangleCoords(coords)

    return {
      rectangle,
      type: 'RECTANGLE',
    }
  }

  private _createClippingPaths(): Octopus['PathLike'][] {
    return asArray(
      this._sourceLayer.clippingPaths
        ?.map((sourceLayer) => {
          return {
            ...new OctopusLayerShapeShapeAdapter({
              parent: this._parent,
              layerSequence: { sourceLayers: [sourceLayer] },
            })._getPath(),
            transform: sourceLayer.transformMatrix,
          }
        })
        .filter((path) => !!path) as Octopus['PathLike'][]
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
      parent: this._parent,
    })
  }

  private _parseSourceShading(): Octopus['PathLike'] | null {
    const paths = this._createClippingPaths().filter((path) => path)

    if (paths.length) {
      return this._parseClippingCompound(paths)
    }

    const coords = this._sourceLayer.parentArtboardMediaBox

    return this._parseRect(coords)
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
