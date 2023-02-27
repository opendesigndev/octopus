import { asArray } from '@opendesign/octopus-common/dist/utils/as.js'
import { push } from '@opendesign/octopus-common/dist/utils/common.js'

import { createSourceLayer } from '../../factories/create-source-layer.js'
import { SourceLayerCommon } from './source-layer-common.js'

import type { SourceLayer } from '../../factories/create-source-layer.js'
import type { RawBooleanOperation, RawLayerShape } from '../../typings/raw/index.js'
import type { SourceLayerParent } from './source-layer-common.js'

type SourceLayerShapeOptions = {
  parent: SourceLayerParent
  rawValue: RawLayerShape
}

type SourceShapeType = 'RECTANGLE' | 'LINE' | 'VECTOR' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'STAR' | 'BOOLEAN_OPERATION'

export class SourceLayerShape extends SourceLayerCommon {
  declare _rawValue: RawLayerShape
  private _children: SourceLayer[]

  constructor(options: SourceLayerShapeOptions) {
    super(options)
    this._children = this._initLayers()
  }

  private _initLayers() {
    const children = asArray(this._rawValue?.children)
    return children.reduce((children: SourceLayerShape[], layer: RawLayerShape) => {
      const sourceLayer = createSourceLayer({ parent: this, layer })
      return sourceLayer ? push(children, sourceLayer) : children
    }, [])
  }

  get type(): 'SHAPE' {
    return 'SHAPE'
  }

  get shapeType(): SourceShapeType | undefined {
    return this._rawValue.type
  }

  get children(): SourceLayer[] {
    return this._children
  }

  get booleanOperation(): RawBooleanOperation | undefined {
    return this._rawValue.booleanOperation
  }
}
