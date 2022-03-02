import { asArray } from '@avocode/octopus-common/dist/utils/as'

import OctopusLayerCommon from './octopus-layer-common'
import Point from './octopus-point'
import OctopusEffectsShape from './octopus-effects-shape'
import createShape from '../../utils/create-shape'
import { calculateBottomRightCorner, calculateTopLeftCorner, createRectPoints, isValid } from '../../utils/coords'

import type { LayerSpecifics } from './octopus-layer-common'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { Octopus } from '../../typings/octopus'
import type SourceLayerShape from '../source/source-layer-shape'
import type SourceLayerShapeSubPath from '../source/source-layer-shape-subpath'
import { RawShapeLayerSubPathPoint } from '../../typings/raw'
import type { NormalizedPoint } from './octopus-point'
import type { Coord } from '../../typings'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export default class OctopusLayerShape extends OctopusLayerCommon {
  static DEFAULT_POINT_COORDS = [0, 0, 0, 0, 0, 0, 0]
  static DEFAULT_GEOMETRY = 'MZ'
  static FILL_RULE = {
    'non-zero-winding-number': 'NON_ZERO',
    'even-odd': 'EVEN_ODD',
  } as const
  static DEFAULT_FILL_RULE = 'EVEN_ODD' as const

  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._sourceLayer = options.sourceLayer
  }

  private _isRect(subPath: SourceLayerShapeSubPath): boolean {
    return subPath.type == 'Rect'
  }

  private _parseRectangleCoords(coords: number[]): { x0: number; y0: number; x1: number; y1: number } {
    const rectPoints = createRectPoints(coords)
    const [x0, y0] = calculateTopLeftCorner(rectPoints)
    const [x1, y1] = calculateBottomRightCorner(rectPoints)

    return { x0, y0, x1, y1 }
  }

  private _parseRect(coords: SourceLayerShapeSubPath['_coords']): Octopus['PathRectangle'] {
    const rectangle = this._parseRectangleCoords(coords)

    return {
      rectangle,
      type: 'RECTANGLE',
      transform: this._sourceLayer.transformMatrix,
    }
  }

  private _createClippingPaths(): Octopus['PathLike'][] {
    return asArray(
      this._sourceLayer.clippingPaths
        ?.map((sourceLayer) => {
          return { ...new OctopusLayerShape({ parent: this, sourceLayer })._getPath() }
        })
        .filter((path) => !!path) as Octopus['PathLike'][]
    )
  }

  private _parseCompound(op: Octopus['CompoundPath']['op'], paths: Octopus['PathLike'][]): Octopus['CompoundPath'] {
    return {
      type: 'COMPOUND',
      op,
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

  private _createGeometry(shape: SourceLayerShapeSubPath): string {
    const validRawPoints = asArray(shape.points?.filter(isValid))
    if (validRawPoints.length === 0) {
      return OctopusLayerShape.DEFAULT_GEOMETRY
    }

    const normalizedPoints = this._normalizePoints(validRawPoints)
    const points = normalizedPoints.map((point) => new Point(point).convert())
    const closed = !this._sourceLayer.stroke
    const paperShape = createShape({ closed, points })

    return paperShape?.pathData ?? OctopusLayerShape.DEFAULT_GEOMETRY
  }

  private _parsePath(shape: SourceLayerShapeSubPath): Octopus['Path'] {
    const geometry = this._createGeometry(shape)
    const transform = this._sourceLayer.transformMatrix

    return {
      type: 'PATH',
      geometry,
      transform,
    }
  }

  private _parseSourceShading(): Octopus['PathLike'] | null {
    const paths = this._createClippingPaths().filter((path) => path)

    if (paths.length) {
      return this._parseCompound('INTERSECT', paths)
    }

    const coords = this._sourceLayer.parentArtboardMediaBox

    return this._parseRect(coords)
  }

  private _getPath(sourceSubpath?: SourceLayerShapeSubPath): Octopus['PathLike'] | null {
    if (this._sourceLayer.type === 'Shading') {
      return this._parseSourceShading()
    }

    sourceSubpath = sourceSubpath ?? this._sourceLayer.subpaths[0]
    if (!sourceSubpath) {
      return null
    }

    if (this._isRect(sourceSubpath)) {
      return this._parseRect(sourceSubpath.coords ?? [0, 0, 0, 0])
    }

    return this._parsePath(sourceSubpath)
  }

  private _getShapes(): Octopus['Shape'] | null {
    const path = this._getPath()
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
    return sourceFillRule ? OctopusLayerShape.FILL_RULE[sourceFillRule] : OctopusLayerShape.DEFAULT_FILL_RULE
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> | null {
    const shape = this._getShapes()
    if (!shape) {
      return null
    }

    return {
      type: 'SHAPE',
      shape,
      shapes: undefined /** @TODO remove after schema fix */,
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
