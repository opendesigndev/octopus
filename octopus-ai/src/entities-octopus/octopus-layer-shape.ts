/* eslint-disable @typescript-eslint/ban-ts-comment */
import OctopusLayerCommon, { LayerSpecifics } from './octopus-layer-common'
import { OctopusLayerParent } from '../typings/octopus-entities'
import type { Octopus } from '../typings/octopus'
import SourceLayerShape from '../entities-source/source-layer-shape'
import SourceLayerShapeSubPath from '../entities-source/source-layer-shape-subpath'
import { calculateBottomRightCorner, calculateTopLeftCorner, createRectPoints, isValid } from '../utils/coords'
import OctopusEffectsShape, { ShapeEffects } from './octopus-effects-shape'
import createShape from '../utils/create-shape'
import Point from './octopus-point'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

export default class OctopusLayerShape extends OctopusLayerCommon {
  static FILL_RULE = {
    'non-zero-winding-number': 'NON_ZERO',
    'even-odd': 'EVEN_ODD',
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

  private _parseRect(shape: SourceLayerShapeSubPath) {
    const coords = shape.coords || [0, 0, 0, 0]
    const rectangle = this._parseRectangleCoords(coords)

    return {
      purpose: 'BODY',
      fillRule: this.fillRule,
      path: {
        rectangle,
        type: 'RECTANGLE',
        transform: this._sourceLayer.transformMatrix,
        //@todo check what is this, no idea from illustrator2
        cornerRadii: [0, 0, 0, 0],
      },
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

  private _createGeometry(shape: SourceLayerShapeSubPath) {
    const validRawPoints = shape.points?.filter(isValid) || []
    if (validRawPoints.length === 0) {
      return []
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

    // todo: no sign of radius in octopus2 illustrator, should be removed from type?
    return createShape([
      {
        closed,
        points,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any).pathData
  }

  private _parsePath(shape: SourceLayerShapeSubPath) {
    const geometry = this._createGeometry(shape)
    const transform = this._sourceLayer.transformMatrix

    return {
      purpose: 'BODY',
      path: {
        geometry,
        type: 'PATH',
        transform,
      },
      fillRule: this.fillRule,
      ...this.shapeEffects,
      //@todo check what is this, no idea from illustrator2
      cornerRadii: [0, 0, 0, 0],
    }
  }

  private _parseShapes() {
    return this._sourceLayer.subpaths.map((shape) => {
      if (this._isRect(shape)) {
        return this._parseRect(shape)
      }

      return this._parsePath(shape)
    })
  }

  get fillRule(): string {
    const sourceFillRule = this._sourceLayer.fillRule

    return sourceFillRule ? OctopusLayerShape.FILL_RULE[sourceFillRule] : OctopusLayerShape.FILL_RULE['even-odd']
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> | null {
    return {
      purpose: 'BODY',
      type: 'SHAPE',
      fillRule: this.fillRule,
      //@ts-ignore
      shapes: this._parseShapes(),
    }
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertCommon()

    if (!common) return null
    //@ts-ignore
    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
