import OctopusLayerCommon from './octopus-layer-common'
import { asArray, asNumber } from '../utils/as'
import { convertBooleanOp } from '../utils/boolean-ops'
import { createOctopusLayer } from '../factories/create-octopus-layer'
import { buildShapePathSafe } from '../utils/path-builders'
import OctopusEffectsShape from './octopus-effects-shape'

import type { LayerSpecifics } from './octopus-layer-common'
import type { OctopusLayerParent } from '../typings/octopus-entities'
import type SourceLayerShape from '../entities-source/source-layer-shape'
import type { Octopus } from '../typings/octopus'
import type { RawShapeCompound, RawShapeRect } from '../typings/source'


type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent,
  sourceLayer: SourceLayerShape
}

export default class OctopusLayerShape extends OctopusLayerCommon {
  protected _sourceLayer: SourceLayerShape
  private _children: OctopusLayerShape[]
  private _shapeData: string

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._shapeData = this._normalizeShapeData()
    this._children = this._initChildren()
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
      sourceLayer: this._sourceLayer,
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
      return octopusLayer ? [ ...layers, octopusLayer ] : layers
    }, [])
  }

  private _getShapeAsCompound(): Octopus['CompoundPath'] {
    const compound = this._sourceLayer.shape as RawShapeCompound
    const geometry = typeof compound.path === 'string'
      ? {
        geometry: compound.path
      }
      : null
    return {
      type: 'COMPOUND',
      op: convertBooleanOp(compound),
      paths: this._children.map(shapeLayer => shapeLayer._getShape()),
      ...geometry
    }
  }

  private _getShapeAsRect(): Octopus['PathRectangle'] {
    const rect = this._sourceLayer.shape as RawShapeRect
    const { x, y, width, height } = rect

    return {
      type: 'RECTANGLE',
      rectangle: {
        x0: asNumber(x),
        y0: asNumber(x) + asNumber(width),
        x1: asNumber(y),
        y1: asNumber(y) + asNumber(height),
      },
      cornerRadii: rect?.r
    }
  }

  private _getShapeAsPath(): Octopus['Path'] {
    return {
      type: 'PATH',
      geometry: this._shapeData
    }
  }

  private _getShape():
    Octopus['CompoundPath'] |
    Octopus['PathRectangle'] |
    Octopus['PathLike']
  {
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

  private _getShapes(): Octopus['Shape'][] {
    const fillShape: Octopus['Shape'] = {
      purpose: 'BODY',
      fillRule: 'EVEN_ODD' as 'EVEN_ODD',
      path: this._getShape(),
      ...this.shapeEffects.convert()
    }

    return [ fillShape ]
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