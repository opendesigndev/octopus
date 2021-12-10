import OctopusLayerCommon, { OctopusLayerParent } from './octopus-layer-common'
import SourceLayerShape from './source-layer-shape'

import type { Octopus } from '@avocode/octopus-ts'
import { RawShapeCompound, RawShapeRect } from '../typings/source'
import { asArray, asNumber } from '../utils/as'
import { convertBooleanOp } from '../utils/boolean-ops'
import { createOctopusLayer } from '../factories/create-octopus-layer'
import { buildShapePathSafe } from '../utils/path-builders'


type OctopusLayerShapeOptions = {
  parent: OctopusLayerParent,
  sourceLayer: SourceLayerShape
}

export default class OctopusLayerShape extends OctopusLayerCommon {
  _parent: OctopusLayerParent
  _sourceLayer: SourceLayerShape
  _children: OctopusLayerShape[]
  _shapeData: string

  constructor(options: OctopusLayerShapeOptions) {
    super(options)
    this._shapeData = this._normalizeShapeData()
    this._children = this._initChildren()
  }

  _normalizeShapeData() {
    return buildShapePathSafe(this._sourceLayer.shape)
  }

  _initChildren() {
    return asArray(this._sourceLayer.children).reduce((layers, shapeLayer) => {
      const octopusLayer = createOctopusLayer({
        parent: this,
        layer: shapeLayer
      }) as OctopusLayerShape
      return octopusLayer ? [ ...layers, octopusLayer ] : layers
    }, [])
  }

  get shapeType() {
    return this._sourceLayer.shapeType
  }

  _getShapeAsCompound(): Octopus['schemas']['CompoundPath'] {
    const compound = this._sourceLayer.shape as RawShapeCompound
    const geometry = typeof compound.path === 'string'
      ? {
        geometry: compound.path
      }
      : null
    return {
      type: 'COMPOUND',
      op: convertBooleanOp(compound),
      paths: this._children.map(shapeLayer => shapeLayer.getShape()),
      ...geometry
    }
  }

  /**
   * @TODO 
   * PathRectangle's type `type` property should have tighter value than base's one
   * l, r, t, b? why r/b instead of w/h? matrix as array? etc?
   * if shape is top-level (not child of compound one), should matrix be only on layer-level or on shape-level?
   */
  _getShapeAsRect(): Octopus['schemas']['PathRectangle'] {
    const { x, y, width, height } = this._sourceLayer.shape as RawShapeRect
    return {
      type: 'RECTANGLE',
      l: asNumber(x),
      r: asNumber(x) + asNumber(width),
      t: asNumber(y),
      b: asNumber(y) + asNumber(height),
      cornerRadii: [] /** @TODO add later */
    }
  }

  _getShapeAsPath(): Octopus['schemas']['Path'] {
    return {
      type: 'PATH',
      geometry: this._shapeData,
      cornerRadii: [] /** @TODO add later */
    }
  }

  getShape():
    Octopus['schemas']['CompoundPath'] |
    Octopus['schemas']['PathRectangle'] |
    Octopus['schemas']['PathLike']
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

  /**
   * @TODO 
   * should be fillRule optional?
   * `shape: unknown`?
   * why is `path` optional?
   */
  _getShapes(): Octopus['schemas']['Shape'][] {
    const fillShape = {
      purpose: 'FILL' as 'FILL',
      fillRule: 'EVEN_ODD' as 'EVEN_ODD',
      path: this.getShape(),
      shape: undefined /** @TODO remove after types fix */
    }

    return [ fillShape ]
  }

  /**
   * @TODOs
   * Guard with correct return type
   * @returns 
   */
  convertTypeSpecific(): any {
    const shapes = this._getShapes()
    return {
      shapes
    }
  }
}