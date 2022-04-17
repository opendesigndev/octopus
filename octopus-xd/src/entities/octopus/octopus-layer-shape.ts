import { asArray, asNumber } from '@avocode/octopus-common/dist/utils/as'
import { getMapped, push } from '@avocode/octopus-common/dist/utils/common'

import { createOctopusLayer } from '../../factories/create-octopus-layer'
import { buildShapePathSafe } from '../../utils/path-builders'
import { convertArrayToPaperMatrix, convertObjectToPaperMatrix } from '../../utils/matrix'
import defaults from '../../utils/defaults'
import { createMatrix } from '../../utils/paper'
import OctopusLayerCommon from './octopus-layer-common'
import OctopusEffectsShape from './octopus-effects-shape'

import type { Raw2DMatrix, RawShapeCompound, RawShapeRect } from '../../typings/source'
import type { Octopus } from '../../typings/octopus'
import type SourceLayerShape from '../source/source-layer-shape'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type { LayerSpecifics } from './octopus-layer-common'
import type paper from 'paper'

type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent
  sourceLayer: SourceLayerShape
}

type ShapeData = {
  shape: paper.Path | paper.CompoundPath
  normalizationOffset: { x: number; y: number }
  compilationOffset: { x: number; y: number }
}
export default class OctopusLayerShape extends OctopusLayerCommon {
  protected _sourceLayer: SourceLayerShape
  private _children: OctopusLayerShape[]
  private _shapeData: ShapeData

  static BOOLEAN_OPS = {
    add: 'UNION',
    subtract: 'SUBTRACT',
    intersect: 'INTERSECT',
    exclude: 'EXCLUDE',
  } as const

  static FILL_RULES = {
    nonzero: 'NON_ZERO',
    evenodd: 'EVEN_ODD',
  } as const

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._shapeData = this._normalizeShapeData()
    this._children = this._initChildren()
  }

  get shapeData(): ShapeData {
    return this._shapeData
  }

  get transform(): Octopus['Transform'] {
    /**
     * Following normalization is due to XD's weird way of saving shapes + its matrix sometimes.
     * Sometimes geometry is unnecessarily moved and compensated by matrix tx/ty.
     * We move geometry back to x: 0, y: 0 and normalize matrix.
     * */
    const { x, y } = this._shapeData.normalizationOffset
    const transform = convertArrayToPaperMatrix(super.transform)
    const shapeOffsetMatrix = createMatrix(1, 0, 0, 1, x, y)
    return transform.append(shapeOffsetMatrix).values
  }

  get shapeEffects(): OctopusEffectsShape {
    const resources = this.parentArtboard?.sourceDesign.resources

    if (!resources) {
      throw new Error("Design resources are missing, can't resolve effects.")
    }

    return new OctopusEffectsShape({
      octopusLayer: this,
      resources,
    })
  }

  private _normalizeShapeData() {
    return buildShapePathSafe(this._sourceLayer.shape)
  }

  private _initChildren() {
    return asArray(this._sourceLayer.children).reduce((layers, shapeLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: shapeLayer,
      }) as OctopusLayerShape
      return octopusLayer ? push(layers, octopusLayer) : layers
    }, [])
  }

  private _getLayerTransformEntry() {
    const { x, y } = this._shapeData.normalizationOffset
    const matrix = convertObjectToPaperMatrix(this._sourceLayer.transform as Raw2DMatrix)
    const shapeOffsetMatrix = createMatrix(1, 0, 0, 1, x, y)
    const transform = matrix.append(shapeOffsetMatrix).values
    return transform ? { transform } : null
  }

  private _convertBooleanOp(shape: RawShapeCompound) {
    const rawOp = shape.operation as keyof typeof OctopusLayerShape.BOOLEAN_OPS
    return OctopusLayerShape.BOOLEAN_OPS[rawOp] ?? defaults.SHAPE.BOOLEAN_OP
  }

  private _getShapeAsCompound(): Octopus['CompoundPath'] {
    const compound = this._sourceLayer.shape as RawShapeCompound
    const geometry =
      typeof compound.path !== 'string'
        ? null
        : {
            geometry: compound.path,
          }
    const transform = this._getLayerTransformEntry()

    return {
      type: 'COMPOUND',
      op: this._convertBooleanOp(compound),
      paths: this._children.map((shapeLayer) => shapeLayer._getShape()),
      ...transform,
      ...geometry,
    }
  }

  private _getShapeAsRectWithSimpleRadius(): Octopus['PathRectangle'] {
    const rect = this._sourceLayer.shape as RawShapeRect
    const { x, y, width, height, r } = rect
    const transform = this._getLayerTransformEntry()

    const simpleRadius = typeof r?.[0] === 'number' ? { cornerRadius: r?.[0] } : null

    return {
      type: 'RECTANGLE',
      rectangle: {
        x0: asNumber(x),
        x1: asNumber(x) + asNumber(width),
        y0: asNumber(y),
        y1: asNumber(y) + asNumber(height),
      },
      ...simpleRadius,
      ...transform,
    }
  }

  private _getShapeAsRectWithMultipleRadii(): Octopus['Path'] {
    const rect = this._sourceLayer.shape as RawShapeRect
    const { r } = rect
    const transform = this._getLayerTransformEntry()

    return {
      type: 'PATH',
      geometry: this._shapeData.shape.pathData,
      ...transform,
      cornerRadii: r /** @TODO define correct order */,
      meta: {
        sourceShape: 'RECTANGLE',
      },
    }
  }

  private _getSimplePath(): Octopus['Path'] {
    const transform = this._getLayerTransformEntry()
    const geometry = this._shapeData.shape.pathData

    return {
      type: 'PATH',
      geometry,
      ...transform,
    }
  }

  private _getCompoundSimplePath(path: paper.Path): Octopus['Path'] {
    return {
      type: 'PATH',
      geometry: path.pathData,
    }
  }

  private _getShapeAsCompoundPathNoop(): Octopus['CompoundPath'] {
    const transform = this._getLayerTransformEntry()
    const geometry = this._shapeData.shape.pathData

    return {
      type: 'COMPOUND',
      geometry,
      ...transform,
      paths: this._shapeData.shape.children.map((path: paper.Path) => this._getCompoundSimplePath(path)),
    }
  }

  private _getShapeAsPath(): Octopus['Path'] | Octopus['CompoundPath'] {
    return asArray(this._shapeData.shape.children).length > 1
      ? this._getShapeAsCompoundPathNoop()
      : this._getSimplePath()
  }

  private _rectangleHasMultipleRadii() {
    const radii = (this._sourceLayer.shape as RawShapeRect).r
    if (!Array.isArray(radii) || !radii.length) return false
    return radii.some((radius) => radius !== radii[0])
  }

  private _getShape(): Octopus['PathLike'] {
    switch (this._sourceLayer.shapeType) {
      case 'compound': {
        return this._getShapeAsCompound()
      }
      case 'rect': {
        return this._rectangleHasMultipleRadii()
          ? this._getShapeAsRectWithMultipleRadii()
          : this._getShapeAsRectWithSimpleRadius()
      }
    }
    return this._getShapeAsPath()
  }

  private _getRootShape(): Octopus['Shape']['path'] {
    const path = this._getShape()
    /**
     * Exclude transformation on layer's root shape because this should be placed on layer's level.
     */
    return Object.fromEntries(
      Object.entries(path).filter(([name]) => {
        return name !== 'transform'
      })
    ) as Octopus['Shape']['path']
  }

  private _getFillRule(): Octopus['FillRule'] {
    return getMapped(this._sourceLayer.shape?.winding, OctopusLayerShape.FILL_RULES, 'NON_ZERO')
  }

  private _getShapes(): Octopus['Shape'] {
    const path = this._getRootShape()
    const fillRule = this._getFillRule()

    const fillShape: Octopus['Shape'] = {
      fillRule,
      path,
      ...this.shapeEffects.convert(),
    } as const

    return fillShape
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    const shape = this._getShapes()
    return {
      type: 'SHAPE',
      shape,
    }
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific(),
    }
  }
}
