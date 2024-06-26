import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'

import { OctopusEffectsShape } from './octopus-effects-shape.js'
import { OctopusLayerCommon } from './octopus-layer-common.js'
import OctopusPoint from './octopus-point.js'
import { isValid } from '../../utils/coords.js'
import { createShape } from '../../utils/create-shape.js'
import { parseRect } from '../../utils/rectangle.js'

import type { LayerSpecifics } from './octopus-layer-common.js'
import type { NormalizedPoint } from './octopus-point.js'
import type { LayerSequence } from '../../services/conversion/text-layer-grouping-service/index.js'
import type { Coord } from '../../typings/index.js'
import type { Octopus, OctopusLayerShapeAdapter } from '../../typings/octopus/index.js'
import type { OctopusLayerParent } from '../../typings/octopus-entities.js'
import type { RawShapeLayerSubPathPoint } from '../../typings/raw/index.js'
import type { SourceLayerShapeSubPath } from '../source/source-layer-shape-subpath.js'
import type { SourceLayerShape } from '../source/source-layer-shape.js'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  layerSequence: LayerSequence
}

export class OctopusLayerShapeShapeAdapter extends OctopusLayerCommon implements OctopusLayerShapeAdapter {
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

  private _isRect(subPath: SourceLayerShapeSubPath): boolean {
    return subPath.type === 'Rect'
  }

  private _parseCompound(subpaths: SourceLayerShapeSubPath[]): Octopus['CompoundPath'] | null {
    const paths = subpaths.map((subpath) => this._getPathFromSubpath(subpath))

    if (!paths) {
      return null
    }

    return {
      type: 'COMPOUND',
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

  private _normalizePoints(points: RawShapeLayerSubPathPoint[]): NormalizedPoint[] {
    return points.reduce((coordArray: NormalizedPoint[], point, index) => {
      const coords = point.Coords
      if (!coords) {
        return coordArray
      }

      if (point.Type === 'Line' || point.Type === 'Move') {
        coordArray.push({ anchor: [...(coords.slice(0, 2) as Coord)] })
        return coordArray
      }

      const previousOutBezier = coords.slice(0, 2) as Coord
      coordArray[index - 1] = { ...coordArray[index - 1], outBezier: previousOutBezier }

      const inBezier = coords.slice(2, 4) as Coord
      const anchor = coords.slice(4, 6) as Coord
      coordArray.push({ inBezier, anchor })
      return coordArray
    }, [])
  }

  private _createSubpathGeometry(subpath: SourceLayerShapeSubPath): string {
    const validRawPoints = asArray(subpath.points?.filter(isValid))
    const normalizedPoints = this._normalizePoints(validRawPoints)
    const points = normalizedPoints.map((point) => new OctopusPoint(point).convert())
    const forceClosed = !(this._sourceLayer.stroke ?? true)
    const closed = subpath.closed ?? forceClosed
    const paperShape = createShape({ closed, points })

    return paperShape?.pathData ?? OctopusLayerShapeShapeAdapter.DEFAULT_GEOMETRY
  }

  private _parsePath(path: SourceLayerShapeSubPath): Octopus['Path'] {
    const geometry = this._createSubpathGeometry(path)

    return {
      type: 'PATH',
      geometry,
    }
  }

  public getPath(): Octopus['PathLike'] | null {
    const sourceSubpaths = this._sourceLayer.subpaths

    if (sourceSubpaths.length > 1) {
      return this._parseCompound(sourceSubpaths)
    }

    if (!sourceSubpaths || !sourceSubpaths.length) {
      return null
    }

    return this._getPathFromSubpath(sourceSubpaths[0])
  }

  private _getPathFromSubpath(sourceSubpath: SourceLayerShapeSubPath): Octopus['PathLike'] {
    if (this._isRect(sourceSubpath)) {
      return parseRect(sourceSubpath.coords ?? OctopusLayerShapeShapeAdapter.DEFAULT_RECT_COORDS)
    }

    return this._parsePath(sourceSubpath)
  }

  private _getShapes(): Octopus['Shape'] | null {
    const path = this.getPath()
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
    return sourceFillRule
      ? OctopusLayerShapeShapeAdapter.FILL_RULE[sourceFillRule]
      : OctopusLayerShapeShapeAdapter.DEFAULT_FILL_RULE
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
      transform: this._sourceLayer.transformMatrix,
    } as const
  }
}
