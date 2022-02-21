import OctopusLayerCommon from './octopus-layer-common'
import Point from './octopus-point'
import OctopusEffectsShape from './octopus-effects-shape'
import createShape from '../utils/create-shape'
import { calculateBottomRightCorner, calculateTopLeftCorner, createRectPoints, isValid } from '../utils/coords'

import type { LayerSpecifics } from './octopus-layer-common'
import type { OctopusLayerParent } from '../typings/octopus-entities'
import type { Octopus } from '../typings/octopus'
import type SourceLayerShape from '../entities-source/source-layer-shape'
import type SourceLayerShapeSubPath from '../entities-source/source-layer-shape-subpath'
import type { ShapeEffects } from './octopus-effects-shape'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export default class OctopusLayerShape extends OctopusLayerCommon {
  static FILL_RULE = {
    'non-zero-winding-number': 'NON_ZERO' as const,
    'even-odd': 'EVEN_ODD' as const,
  }

  protected _sourceLayer: SourceLayerShape

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._sourceLayer = options.sourceLayer
  }

  private _isRect(subPath: SourceLayerShapeSubPath) {
    return subPath.type == 'Rect'
  }

  private _parseRectangleCoords(coords: number[]) {
    const rectPoints = createRectPoints(coords)
    const [x0, y0] = calculateTopLeftCorner(rectPoints)
    const [x1, y1] = calculateBottomRightCorner(rectPoints)

    return { x0, y0, x1, y1 }
  }

  private _parseRect(shape: SourceLayerShapeSubPath): Octopus['PathRectangle'] {
    const coords = shape.coords || [0, 0, 0, 0]
    const rectangle = this._parseRectangleCoords(coords)

    return {
      rectangle,
      type: 'RECTANGLE',
      transform: this._sourceLayer.transformMatrix,
      ...this.shapeEffects,
    }
  }

  get shapeEffects(): ShapeEffects {
    const sourceLayer = this._sourceLayer
    const resources = this._parent.resources

    if (!resources) {
      throw new Error("Design resources are missing, can't resolve effects.")
    }

    return new OctopusEffectsShape({
      sourceLayer,
      resources,
    }).convert()
  }

  private _createGeometry(shape: SourceLayerShapeSubPath): string {
    const validRawPoints = shape.points?.filter(isValid) || []
    if (validRawPoints.length === 0) {
      return ''
    }

    const points = validRawPoints
      .slice(1)
      .reduce(
        (points, pointData) => {
          switch (pointData.Type) {
            case 'Curve': {
              const [x1, y1, x2, y2, x3, y3] = pointData.Coords
              const point = new Point([x3, y3])
              points[points.length - 1].outBezier = [x1, y1]
              point.inBezier = [x2, y2]
              points.push(point)
              break
            }
            case 'Line': {
              points.push(new Point(pointData.Coords))
              break
            }
          }
          return points
        },
        [new Point(validRawPoints[0].Coords)]
      )
      .map((point) => point.toOctopus())
    const closed = !this._sourceLayer.stroke
    const paperShape = createShape({ closed, points })

    return paperShape?.pathData || ''
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

  private _getPath(): Octopus['Shape']['path'] | null {
    const sourceSubpath = this._sourceLayer.subpaths[0]
    if (!sourceSubpath) {
      return null
    }

    if (this._isRect(sourceSubpath)) {
      return this._parseRect(sourceSubpath)
    }

    return this._parsePath(sourceSubpath)
  }

  private _getShapes(): Octopus['Shape'] | null {
    const path = this._getPath()
    if (!path) {
      return null
    }

    const fillShape: Octopus['Shape'] = {
      fillRule: this.fillRule,
      path,
      ...this.shapeEffects,
    } as const

    return fillShape
  }

  get fillRule(): 'NON_ZERO' | 'EVEN_ODD' {
    const sourceFillRule = this._sourceLayer.fillRule
    return sourceFillRule ? OctopusLayerShape.FILL_RULE[sourceFillRule] : OctopusLayerShape.FILL_RULE['even-odd']
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
