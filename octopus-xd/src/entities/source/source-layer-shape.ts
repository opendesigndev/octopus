import { asArray } from '@avocode/octopus-common/dist/utils/as'
import { push } from '@avocode/octopus-common/dist/utils/common'

import { createSourceLayer } from '../../factories/create-source-layer'
import SourceLayerCommon from './source-layer-common'

import type { Defined } from '../../typings/helpers'
import type { RawShapeCompound, RawShapeLayer } from '../../typings/source'
import type { SourceLayerParent } from './source-layer-common'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
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
        layer: shapeLayer,
      })
      return layer ? push(children, layer as SourceLayerShape) : children
    }, [])
  }

  get shape(): RawShapeLayer['shape'] {
    return this._rawValue?.shape
  }

  get shapeType(): Defined<RawShapeLayer['shape']>['type'] {
    return this._rawValue.shape?.type
  }

  get children(): SourceLayerShape[] | null {
    return this._children
  }
}
