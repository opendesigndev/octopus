import OctopusLayerCommon from './octopus-layer-common'
import { asArray, asNumber } from '@avocode/octopus-common/dist/utils/as'
import { createOctopusLayer } from '../../factories/create-octopus-layer'
import { buildShapePathSafe } from '../../utils/path-builders'
import { convertObjectMatrixToArray } from '../../utils/matrix'
import OctopusEffectsShape from './octopus-effects-shape'

import type paper from 'paper'
import type { LayerSpecifics } from './octopus-layer-common'
import type { OctopusLayerParent } from '../../typings/octopus-entities'
import type SourceLayerShape from '../source/source-layer-shape'
import type { Octopus } from '../../typings/octopus'
import type { RawShapeCompound, RawShapeRect } from '../../typings/source'
import defaults from '../../utils/defaults'


type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent,
  sourceLayer: SourceLayerShape
}

export default class OctopusLayerShape extends OctopusLayerCommon {
  protected _sourceLayer: SourceLayerShape
  private _children: OctopusLayerShape[]
  private _shapeData: paper.Path | paper.CompoundPath

  static BOOLEAN_OPS = {
    add: 'UNION',
    subtract: 'SUBTRACT',
    intersect: 'INTERSECT',
    exclude: 'EXCLUDE'
  } as const

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._shapeData = this._normalizeShapeData()
    this._children = this._initChildren()
  }

  get shapeData() {
    return this._shapeData
  }

  get shapeType() {
    return this._sourceLayer.shapeType
  }

  get shapeEffects() {
    const resources = this.parentArtboard?.sourceDesign.resources

    if (!resources) {
      throw new Error('Design resources are missing, can\'t resolve effects.')
    }

    return new OctopusEffectsShape({
      octopusLayer: this,
      resources
    })
  }

  private _normalizeShapeData() {
    return buildShapePathSafe(this._sourceLayer.shape)
  }

  private _initChildren() {
    return asArray(this._sourceLayer.children).reduce((layers, shapeLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: shapeLayer
      }) as OctopusLayerShape
      return octopusLayer ? [...layers, octopusLayer] : layers
    }, [])
  }

  private _getLayerTransformEntry() {
    const matrix = convertObjectMatrixToArray(this._sourceLayer.transform)
    return matrix ? { transform: matrix } : null
  }

  private _convertBooleanOp(shape: RawShapeCompound) {
    const rawOp = shape.operation as keyof typeof OctopusLayerShape.BOOLEAN_OPS
    return (OctopusLayerShape.BOOLEAN_OPS[rawOp]) ?? defaults.SHAPE.BOOLEAN_OP
  }

  private _getShapeAsCompound(): Octopus['CompoundPath'] {
    const compound = this._sourceLayer.shape as RawShapeCompound
    const geometry = typeof compound.path !== 'string' ? null : {
      geometry: compound.path
    }
    const transform = this._getLayerTransformEntry()

    return {
      type: 'COMPOUND',
      op: this._convertBooleanOp(compound),
      paths: this._children.map(shapeLayer => shapeLayer._getShape()),
      ...transform,
      ...geometry
    }
  }

  private _getShapeAsRect(): Octopus['PathRectangle'] {
    const rect = this._sourceLayer.shape as RawShapeRect
    const { x, y, width, height } = rect
    const transform = this._getLayerTransformEntry()

    return {
      type: 'RECTANGLE',
      rectangle: {
        x0: asNumber(x),
        x1: asNumber(x) + asNumber(width),
        y0: asNumber(y),
        y1: asNumber(y) + asNumber(height),
      },
      cornerRadii: rect?.r,
      ...transform,
    }
  }

  private _getShapeAsPath(): Octopus['Path'] {
    const transform = this._getLayerTransformEntry()

    return {
      type: 'PATH',
      geometry: this._shapeData.pathData,
      ...transform,
    }
  }

  private _getShape(): Octopus['PathLike'] {
    switch (this.shapeType) {
      case 'compound': {
        return this._getShapeAsCompound()
      }
      case 'rect': {
        return this._getShapeAsRect()
      }
    }
    return this._getShapeAsPath()
  }

  private _getRootShape(): Octopus['Shape']['path'] {
    const path = this._getShape()
    /**
     * Exclude transformation on layer's root shape because this should be placed on layer's level.
     */
    return Object.fromEntries(Object.entries(path).filter(([name]) => {
      return name !== 'transform'
    })) as Octopus['Shape']['path']
  }

  private _getShapes(): Octopus['Shape'][] {
    const path = this._getRootShape()

    const fillShape: Octopus['Shape'] = {
      purpose: 'BODY',
      fillRule: 'EVEN_ODD',
      path,
      ...this.shapeEffects.convert()
    } as const

    return [fillShape]
  }

  private _convertTypeSpecific(): LayerSpecifics<Octopus['ShapeLayer']> {
    const shapes = this._getShapes()
    return {
      type: 'SHAPE',
      shapes
    }
  }

  convert(): Octopus['ShapeLayer'] | null {
    const common = this.convertCommon()
    if (!common) return null

    return {
      ...common,
      ...this._convertTypeSpecific()
    }
  }
}