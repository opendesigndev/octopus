import { createSourceLayer } from '../../factories/create-source-layer'
import { asArray } from '../../utils/as'
import SourceLayerCommon from './source-layer-common'

import type { SourceLayerParent } from './source-layer-common'
import type { RawShapeCompound, RawShapeLayer } from '../../typings/source'


type SourceLayerShapeOptions = {
  parent: SourceLayerParent,
  rawValue: RawShapeLayer
}

export default class SourceLayerShape extends SourceLayerCommon {
  protected _rawValue: RawShapeLayer
  protected _parent: SourceLayerParent
  private _children: SourceLayerShape[] | null

  constructor(options: SourceLayerShapeOptions) {
    super()
    this._parent = options.parent
    this._rawValue = options.rawValue
    this._children = this._initChildren()
  }

  private _initChildren() {
    if (this.shapeType !== 'compound') {
      return null
    }
    return asArray((this._rawValue.shape as RawShapeCompound).children).reduce((children, shapeLayer) => {
      const layer = createSourceLayer({
        parent: this,
        layer: shapeLayer
      })
      return layer ? [ ...children, layer as SourceLayerShape ] : children
    }, [])
  }

  get shape() {
    return this._rawValue?.shape
  }

  get shapeType() {
    return this._rawValue.shape?.type
  }

  get children() {
    return this._children
  }
}
